"use client";

import { useInit, useEncrypt, useDecrypt, useStatus } from "@fhevm/react";
import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { deployedContracts, type SupportedChainId } from "~/contracts/deployedContracts";

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

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">🔐 Encrypted Counter Demo</h2>

        {/* Status Section */}
        <div className="alert alert-info">
          <div className="flex items-center gap-2">
            <span className="font-semibold">FHEVM Status:</span>
            <span>{status}</span>
            {isInitializing && <span className="loading loading-spinner loading-sm"></span>}
            {isReady && <span className="text-success">✅</span>}
          </div>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="alert alert-warning">
            <span>⚠️ Please connect your wallet to use FHEVM features</span>
          </div>
        )}

        {/* Initialization Error */}
        {initError && (
          <div className="alert alert-error">
            <div>
              <span className="font-semibold">Init Error:</span>
              <p className="text-sm">{initError.message}</p>
            </div>
          </div>
        )}

        {/* Network Info */}
        {chainId && contract && (
          <div className="alert">
            <div className="w-full">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Network:</span>{" "}
                  {chainId === 11155111 ? "Sepolia Testnet" : `Chain ID ${chainId}`}
                </div>
                <div className="text-xs opacity-70">
                  Contract: {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Not Supported Warning */}
        {chainId && !contract && (
          <div className="alert alert-warning">
            <span>⚠️ Contract not deployed on this network. Please switch to Sepolia testnet.</span>
          </div>
        )}

        <div className="divider">Encrypt</div>

        {/* Encrypt Section */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Value to encrypt (euint32)</span>
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="input input-bordered"
            disabled={!isReady || isEncrypting}
            min="0"
          />
        </div>

        <button
          onClick={handleEncrypt}
          className="btn btn-primary"
          disabled={!isReady || isEncrypting || !isConnected || !contract}
        >
          {isEncrypting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Encrypting...
            </>
          ) : (
            "🔒 Encrypt Value"
          )}
        </button>

        {/* Encryption Error */}
        {encryptError && (
          <div className="alert alert-error">
            <div>
              <span className="font-semibold">Encrypt Error:</span>
              <p className="text-sm">{encryptError.message}</p>
            </div>
          </div>
        )}

        {/* Encrypted Data Display */}
        {encryptedData && (
          <div className="mockup-code text-xs">
            <pre><code>{JSON.stringify(encryptedData, null, 2)}</code></pre>
          </div>
        )}

        <div className="divider">Decrypt</div>

        {/* Decrypt Section */}
        <button
          onClick={handleDecrypt}
          className="btn btn-secondary"
          disabled={!isReady || isDecrypting || !isConnected || !encryptedData || !contract}
        >
          {isDecrypting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Decrypting...
            </>
          ) : (
            "🔓 Decrypt Value (Demo)"
          )}
        </button>

        {/* Decryption Error */}
        {decryptError && (
          <div className="alert alert-error">
            <div>
              <span className="font-semibold">Decrypt Error:</span>
              <p className="text-sm">{decryptError.message}</p>
            </div>
          </div>
        )}

        {/* Decrypted Data Display */}
        {decryptedData && (
          <div className="alert alert-success">
            <div>
              <span className="font-semibold">✅ Decrypted Result:</span>
              <pre className="mt-2 text-sm">{JSON.stringify(decryptedData, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="divider">About This Demo</div>

        {/* Info Section */}
        <div className="text-sm opacity-70 space-y-2">
          <p className="font-medium">This demo showcases the <code>@fhevm/react</code> hooks:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
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
          </ul>
          <p className="mt-4 text-xs">
            <strong>Note:</strong> This is a demonstration. In a real application, you would send
            the encrypted data to the smart contract for computation.
          </p>
        </div>
      </div>
    </div>
  );
}
