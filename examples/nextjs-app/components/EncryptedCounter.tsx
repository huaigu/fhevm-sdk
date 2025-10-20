"use client";

import { useInit, useEncrypt, useDecrypt, useStatus } from "@fhevm/react";
import { BrowserProvider } from "ethers";
import { AlertCircle, CheckCircle2, Info, Loader2, Lock, LockOpen, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { deployedContracts, type SupportedChainId } from "~/contracts/deployedContracts";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

/**
 * EncryptedCounter - Demonstration of @fhevm/react hooks
 *
 * This component showcases the complete FHEVM workflow:
 * 1. Initialize FHEVM instance with useInit()
 * 2. Track initialization status with useStatus()
 * 3. Encrypt data for on-chain computation with useEncrypt()
 * 4. Decrypt results with user signature using useDecrypt()
 */
export function EncryptedCounter() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // FHEVM Hooks
  const { init, status, error: initError } = useInit();
  const { isLoading: isInitializing, isReady } = useStatus();
  const { encrypt, data: encryptedData, isLoading: isEncrypting, error: encryptError } = useEncrypt();
  const {
    decrypt,
    data: decryptedData,
    isLoading: isDecrypting,
    error: decryptError,
  } = useDecrypt();

  // Demo state
  const [value, setValue] = useState<number>(1);
  const [onChainRequestId, setOnChainRequestId] = useState<string>("");
  const [onChainDecrypted, setOnChainDecrypted] = useState<string>("");
  const [isRequestingDecryption, setIsRequestingDecryption] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Get contract for current network
  const contract = chainId && (chainId in deployedContracts)
    ? deployedContracts[chainId as SupportedChainId].FHECounter
    : null;

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && walletClient && !isReady && !isInitializing && typeof window !== 'undefined') {
      const initFhevm = async () => {
        try {
          // Use window.ethereum as EIP-1193 provider
          await init({ provider: window.ethereum as any });
        } catch (error) {
          console.error("FHEVM init failed:", error);
        }
      };
      initFhevm();
    }
  }, [isConnected, walletClient, isReady, isInitializing, init]);

  // Handlers
  const handleEncrypt = async () => {
    if (!address || !contract) return;

    await encrypt({
      value,
      type: "euint32",
      contractAddress: contract.address,
      userAddress: address,
    });
  };

  const handleDecrypt = async () => {
    if (!encryptedData || !walletClient || !address || !contract) return;

    try {
      // Convert wagmi walletClient to ethers provider/signer
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      await decrypt(
        [
          {
            handle: "0x0000000000000000000000000000000000000000000000000000000000000001",
            contractAddress: contract.address,
          },
        ],
        signer
      );
    } catch (error) {
      console.error("Decrypt failed:", error);
    }
  };

  // On-Chain Decryption: Request
  const handleRequestOnChainDecryption = async () => {
    if (!walletClient || !contract) return;

    try {
      setIsRequestingDecryption(true);
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contractInstance = new (await import("ethers")).Contract(
        contract.address,
        contract.abi,
        signer
      );

      const tx = await contractInstance.requestDecryptCount();
      const receipt = await tx.wait();

      // Extract requestId from DecryptionRequested event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contractInstance.interface.parseLog(log);
          return parsed?.name === "DecryptionRequested";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contractInstance.interface.parseLog(event);
        const requestId = parsed?.args.requestId.toString();
        setOnChainRequestId(requestId);

        // Start polling for result
        pollDecryptionResult(requestId, contractInstance);
      }
    } catch (error) {
      console.error("Request on-chain decryption failed:", error);
    } finally {
      setIsRequestingDecryption(false);
    }
  };

  // Poll for decryption result
  const pollDecryptionResult = async (requestId: string, contractInstance: any) => {
    setIsPolling(true);
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const isCompleted = await contractInstance.isDecryptionCompleted(requestId);

        if (isCompleted) {
          const decryptedValue = await contractInstance.getDecryptedCount(requestId);
          setOnChainDecrypted(decryptedValue.toString());
          setIsPolling(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          console.error("Polling timeout - decryption taking too long");
          setIsPolling(false);
        }
      } catch (error) {
        console.error("Polling error:", error);
        setIsPolling(false);
      }
    };

    poll();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <Lock className="h-8 w-8" />
          Encrypted Counter Demo
        </CardTitle>
        <CardDescription>
          Demonstration of @fhevm/react hooks for Fully Homomorphic Encryption
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Section */}
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>FHEVM Status: {status}</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            {isInitializing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isReady && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </AlertDescription>
        </Alert>

        {/* Connection Warning */}
        {!isConnected && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to use FHEVM features
            </AlertDescription>
          </Alert>
        )}

        {/* Initialization Error */}
        {initError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Initialization Error</AlertTitle>
            <AlertDescription>{initError.message}</AlertDescription>
          </Alert>
        )}

        {/* Network Info */}
        {chainId && contract && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Network Information</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-1 mt-2">
                <div>
                  <strong>Network:</strong>{" "}
                  {chainId === 11155111 ? "Sepolia Testnet" : `Chain ID ${chainId}`}
                </div>
                <div className="text-xs opacity-70">
                  Contract: {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Network Not Supported Warning */}
        {chainId && !contract && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unsupported Network</AlertTitle>
            <AlertDescription>
              Contract not deployed on this network. Please switch to Sepolia testnet.
            </AlertDescription>
          </Alert>
        )}

        {/* Encrypt Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encrypt
          </h3>

          <div className="space-y-2">
            <label htmlFor="encrypt-value" className="text-sm font-medium">
              Value to encrypt (euint32)
            </label>
            <Input
              id="encrypt-value"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              disabled={!isReady || isEncrypting}
              min="0"
              placeholder="Enter a number"
            />
          </div>

          <Button
            onClick={handleEncrypt}
            disabled={!isReady || isEncrypting || !isConnected || !contract}
            className="w-full"
          >
            {isEncrypting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Encrypting...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Encrypt Value
              </>
            )}
          </Button>

          {/* Encryption Error */}
          {encryptError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Encryption Error</AlertTitle>
              <AlertDescription>{encryptError.message}</AlertDescription>
            </Alert>
          )}

          {/* Encrypted Data Display */}
          {encryptedData && (
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-xs overflow-auto">
                <code>{JSON.stringify(encryptedData, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Decrypt Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <LockOpen className="h-5 w-5" />
            Decrypt
          </h3>

          <Button
            onClick={handleDecrypt}
            variant="secondary"
            disabled={!isReady || isDecrypting || !isConnected || !encryptedData || !contract}
            className="w-full"
          >
            {isDecrypting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <LockOpen className="mr-2 h-4 w-4" />
                Decrypt Value (Demo)
              </>
            )}
          </Button>

          {/* Decryption Error */}
          {decryptError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Decryption Error</AlertTitle>
              <AlertDescription>{decryptError.message}</AlertDescription>
            </Alert>
          )}

          {/* Decrypted Data Display */}
          {decryptedData && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Decrypted Result</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 text-sm">
                  {JSON.stringify(decryptedData, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* On-Chain Decryption Section */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Asynchronous On-Chain Decryption
          </h3>
          <p className="text-sm text-muted-foreground">
            Request the decryption oracle to decrypt the encrypted counter value on-chain.
            The result will be available after the oracle processes the request.
          </p>

          <Button
            onClick={handleRequestOnChainDecryption}
            disabled={!isReady || isRequestingDecryption || isPolling || !isConnected || !contract}
            className="w-full"
            variant="outline"
          >
            {isRequestingDecryption ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : isPolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for Oracle...
              </>
            ) : (
              <>
                <Radio className="mr-2 h-4 w-4" />
                Request On-Chain Decryption
              </>
            )}
          </Button>

          {/* Request ID Display */}
          {onChainRequestId && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Request ID</AlertTitle>
              <AlertDescription>
                <code className="text-xs">{onChainRequestId}</code>
              </AlertDescription>
            </Alert>
          )}

          {/* Decrypted Result Display */}
          {onChainDecrypted && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>On-Chain Decrypted Count</AlertTitle>
              <AlertDescription>
                <div className="text-2xl font-bold mt-2">{onChainDecrypted}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>
              <strong>Note:</strong> This demonstrates asynchronous on-chain decryption using
              FHE.requestDecryption().
            </p>
            <p>
              The decryption oracle processes the request and calls back the contract with the
              decrypted value.
            </p>
          </div>
        </div>

        {/* About This Demo */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-6">
          <h3 className="text-lg font-semibold">About This Demo</h3>
          <p className="text-sm text-muted-foreground">
            This demo showcases the <code className="text-primary">@fhevm/react</code> hooks:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>
              <code className="text-primary">useInit()</code> - Initialize FHEVM with your wallet
            </li>
            <li>
              <code className="text-primary">useStatus()</code> - Track FHEVM initialization status
            </li>
            <li>
              <code className="text-primary">useEncrypt()</code> - Encrypt data for on-chain computation
            </li>
            <li>
              <code className="text-primary">useDecrypt()</code> - Decrypt results with user signature
            </li>
            <li>
              <code className="text-primary">requestDecryptCount()</code> - Request on-chain decryption via oracle
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This is a demonstration. In a real application, you would send
            the encrypted data to the smart contract for computation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
