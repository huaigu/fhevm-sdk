"use client";

import { useInit, useEncrypt, useDecrypt, useStatus } from "@0xbojack/fhevm-nextjs";
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
 * EncryptedCounter - Demonstration of @0xbojack/fhevm-nextjs hooks
 *
 * This component showcases the complete FHEVM workflow:
 * 1. Initialize FHEVM instance with useInit()
 * 2. Track initialization status with useStatus()
 * 3. Encrypt data for on-chain computation with useEncrypt()
 * 4. Decrypt results with TWO methods:
 *    a) User Decryption (via Relayer SDK) - instant, client-side, private
 *    b) On-Chain Decryption (via Oracle) - async, on-chain, public
 */
export function EncryptedCounter() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // FHEVM Hooks
  const { init, status, error: initError } = useInit();
  const { isLoading: isInitializing, isReady } = useStatus();
  const { encrypt, isLoading: isEncrypting } = useEncrypt();
  const { decrypt, data: decryptedData, isLoading: isDecrypting, error: decryptError } = useDecrypt();

  // Demo state
  const [value, setValue] = useState<number>(1);
  const [onChainRequestId, setOnChainRequestId] = useState<string>("");
  const [onChainDecrypted, setOnChainDecrypted] = useState<string>("");
  const [isRequestingDecryption, setIsRequestingDecryption] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  // Get contract for current network
  const contract = chainId && (chainId in deployedContracts)
    ? deployedContracts[chainId as SupportedChainId].FHECounter
    : null;

  // Auto-initialize when wallet connects
  useEffect(() => {
    // Only init if: connected, has wallet, not ready, not initializing, and no error
    if (isConnected && walletClient && !isReady && !isInitializing && !initError && typeof window !== 'undefined') {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletClient, isReady, isInitializing, initError]);

  // Handlers
  const handleIncrement = async () => {
    if (!address || !contract || !walletClient) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Step 1: Encrypt the value
      const encrypted = await encrypt({
        value,
        type: "euint32",
        contractAddress: contract.address,
        userAddress: address,
      });

      if (!encrypted) {
        throw new Error("Encryption failed");
      }

      // Step 2: Submit to contract
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contractInstance = new (await import("ethers")).Contract(
        contract.address,
        contract.abi,
        signer
      );

      const tx = await contractInstance.increment!(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      console.log("Increment transaction successful:", tx.hash);
    } catch (error) {
      console.error("Increment failed:", error);
      setSubmitError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User Decryption (via Relayer SDK)
  const handleUserDecrypt = async () => {
    if (!walletClient || !address || !contract) return;

    try {
      // Get encrypted counter handle from contract
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contractInstance = new (await import("ethers")).Contract(
        contract.address,
        contract.abi,
        signer
      );

      const encryptedCountHandle = await contractInstance.getCount!();

      // Decrypt using Relayer SDK
      await decrypt(
        [
          {
            handle: encryptedCountHandle,
            contractAddress: contract.address,
          },
        ],
        signer
      );
    } catch (error) {
      console.error("User decrypt failed:", error);
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

      const tx = await contractInstance.requestDecryptCount!();
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
    setOnChainDecrypted("0"); // Set initial value to 0 to show "processing" state

    const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds (1 minute)
    let attempts = 0;
    const pollInterval = 3000; // Poll every 3 seconds

    const poll = async () => {
      try {
        // Get the decrypted value directly
        const decryptedValue = await contractInstance.getDecryptedCount!(requestId);
        const valueStr = decryptedValue.toString();

        // Update the display with current value (even if 0)
        setOnChainDecrypted(valueStr);

        // Check if decryption is complete (value is not 0, or requester exists)
        const isCompleted = await contractInstance.isDecryptionCompleted!(requestId);

        if (isCompleted && valueStr !== "0") {
          // Decryption completed successfully
          console.log(`Decryption completed! Value: ${valueStr}`);
          setIsPolling(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Polling attempt ${attempts}/${maxAttempts}, current value: ${valueStr}`);
          setTimeout(poll, pollInterval);
        } else {
          console.warn("Polling timeout after 1 minute - callback may take longer");
          setIsPolling(false);
          // Keep the last fetched value displayed
        }
      } catch (error) {
        console.error("Polling error:", error);
        setIsPolling(false);
      }
    };

    // Start polling after a short delay to give the oracle time to process
    setTimeout(poll, 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <Lock className="h-8 w-8" />
          Encrypted Counter Demo
        </CardTitle>
        <CardDescription>
          Demonstration of @0xbojack/fhevm-nextjs hooks for Fully Homomorphic Encryption
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
            <AlertDescription className="space-y-2">
              <p>{initError.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => init({ provider: window.ethereum as any })}
                className="mt-2"
              >
                Retry Initialization
              </Button>
            </AlertDescription>
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

        {/* Increment Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Increment Counter
          </h3>

          <div className="space-y-2">
            <label htmlFor="encrypt-value" className="text-sm font-medium">
              Value to add (encrypted as euint32)
            </label>
            <Input
              id="encrypt-value"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              disabled={!isReady || isSubmitting}
              min="0"
              placeholder="Enter a number"
            />
          </div>

          <Button
            onClick={handleIncrement}
            disabled={!isReady || isSubmitting || !isConnected || !contract}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEncrypting ? "Encrypting..." : "Submitting..."}
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Encrypt & Increment
              </>
            )}
          </Button>

          {/* Submit Error */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Transaction Error</AlertTitle>
              <AlertDescription>{submitError.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* User Decryption Section (via Relayer SDK) */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <LockOpen className="h-5 w-5" />
            User Decryption (via Relayer)
          </h3>
          <p className="text-sm text-muted-foreground">
            Decrypt the current counter value instantly using the Relayer SDK.
            This requires a one-time signature and keeps the decrypted data client-side.
          </p>

          <Button
            onClick={handleUserDecrypt}
            disabled={!isReady || isDecrypting || !isConnected || !contract}
            className="w-full"
            variant="secondary"
          >
            {isDecrypting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <LockOpen className="mr-2 h-4 w-4" />
                Decrypt via Relayer
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

          {/* Decrypted Result */}
          {decryptedData && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Decrypted Counter Value</AlertTitle>
              <AlertDescription>
                <div className="text-2xl font-bold mt-2">
                  {Object.values(decryptedData)[0]?.toString() || 'N/A'}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>
              <strong>How it works:</strong> The contract uses <code>FHE.allow()</code> to grant
              you permission to decrypt the counter value via the Relayer SDK.
            </p>
            <p>
              <strong>Benefits:</strong> ⚡ Instant result (no waiting), one-time signature (365 days), private client-side data.
            </p>
          </div>
        </div>

        {/* On-Chain Decryption Section */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Asynchronous On-Chain Decryption
          </h3>
          <p className="text-sm text-muted-foreground">
            Request the decryption oracle to decrypt the encrypted counter value on-chain.
            The oracle needs time to process - the callback takes a few moments to complete.
          </p>
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>🔄 Auto-Polling:</strong> After requesting decryption, the app will automatically check for results
              every 3 seconds for up to 1 minute. You'll see the value update automatically when the oracle callback completes.
            </AlertDescription>
          </Alert>

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
            <Alert variant={onChainDecrypted === "0" ? "default" : "success"} className={onChainDecrypted === "0" ? "bg-yellow-50 border-yellow-300" : ""}>
              {onChainDecrypted === "0" ? (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle className={onChainDecrypted === "0" ? "text-yellow-800" : ""}>
                {onChainDecrypted === "0" ? "⏰ Callback Not Complete Yet" : "✅ On-Chain Decrypted Count"}
              </AlertTitle>
              <AlertDescription>
                <div className={`text-2xl font-bold mt-2 ${onChainDecrypted === "0" ? "text-yellow-700" : ""}`}>
                  {onChainDecrypted}
                  {onChainDecrypted === "0" && <span className="text-sm ml-2">(pending)</span>}
                </div>
                {onChainDecrypted === "0" ? (
                  <div className="text-xs text-yellow-800 mt-2 space-y-1">
                    <p>
                      <strong>⏳ Oracle is processing...</strong> The decryption callback hasn't completed yet.
                    </p>
                    <p>
                      🔄 Auto-checking every 3 seconds... The value will update automatically when ready.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Callback completed! This value was decrypted on-chain by the oracle.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>
              <strong>How it works:</strong> This uses <code>FHE.requestDecryption()</code> to request
              asynchronous on-chain decryption.
            </p>
            <p>
              <strong>Process:</strong> The oracle processes your request → calls back <code>callbackDecryptCount()</code>
              with the decrypted value → value becomes publicly visible on-chain.
            </p>
            <p className="text-blue-700">
              <strong>🔄 Auto-Polling:</strong> The app automatically checks for results every 3 seconds for up to 1 minute.
              If you see <code>0</code>, it means the callback is still processing.
            </p>
          </div>
        </div>

        {/* About This Demo */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-6">
          <h3 className="text-lg font-semibold">About This Demo</h3>
          <p className="text-sm text-muted-foreground">
            This demo showcases the complete FHEVM workflow using <code className="text-primary">@0xbojack/fhevm-nextjs</code> hooks:
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
              <strong>Encrypt & Submit:</strong> Encrypted values are directly submitted to the smart contract
            </li>
            <li>
              <code className="text-primary">useDecrypt()</code> - Decrypt via Relayer SDK (instant, client-side)
            </li>
            <li>
              <strong>On-Chain Decryption:</strong> Decrypt via oracle (async, public on-chain result)
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Complete Flow:</strong> Enter a value → Click "Encrypt & Increment" →
            The value is encrypted and submitted to contract 0x269e...f8f →
            Choose decryption method: <strong>User Decryption</strong> (instant, private) or
            <strong>On-Chain Decryption</strong> (async, public).
          </p>

          <div className="mt-4 space-y-2 text-xs">
            <h4 className="font-semibold text-sm">Decryption Methods Comparison:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-medium text-primary">User Decryption (Relayer)</p>
                <ul className="list-none space-y-0.5 ml-2">
                  <li>✓ ⚡ Instant result (no waiting)</li>
                  <li>✓ One-time signature (365 days)</li>
                  <li>✓ Data stays client-side (private)</li>
                  <li>✗ Only user can see</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-primary">On-Chain Decryption (Oracle)</p>
                <ul className="list-none space-y-0.5 ml-2">
                  <li>✓ Public on-chain result</li>
                  <li>✓ No signature needed</li>
                  <li>✗ ⏰ Slower (10-60s oracle callback)</li>
                  <li>✗ Costs gas for callback</li>
                  <li className="text-blue-700">🔄 Auto-polls every 3s for 1 minute</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
