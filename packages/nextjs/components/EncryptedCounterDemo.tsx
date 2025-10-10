"use client";

import { useInit, useEncrypt, useDecrypt, useStatus } from "@fhevm/react";
import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { deployedContracts, type SupportedChainId } from "~~/contracts/deployedContracts";

/**
 * EncryptedCounterDemo - Demonstration of @fhevm/react hooks
 *
 * Shows the complete FHEVM workflow:
 * 1. Initialize FHEVM instance
 * 2. Encrypt data for on-chain computation
 * 3. Decrypt results with user signature
 */
export function EncryptedCounterDemo() {
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
  const [value, setValue] = useState<number>(42);

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
        <h2 className="card-title">🔐 FHEVM SDK Demo</h2>

        {/* Status Section */}
        <div className="alert alert-info">
          <div>
            <span className="font-bold">Status:</span> {status}
            {isInitializing && " (Initializing...)"}
            {isReady && " ✅"}
          </div>
        </div>

        {!isConnected && (
          <div className="alert alert-warning">
            <span>Please connect your wallet to use FHEVM features</span>
          </div>
        )}

        {initError && (
          <div className="alert alert-error">
            <span>Init Error: {initError.message}</span>
          </div>
        )}

        {/* Network Info */}
        {chainId && contract && (
          <div className="alert">
            <div className="flex justify-between w-full">
              <div>
                <span className="font-bold">Network:</span>{" "}
                {chainId === 11155111 ? "Sepolia Testnet" : `Chain ID ${chainId}`}
              </div>
              <div className="text-xs opacity-70">
                Contract: {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
              </div>
            </div>
          </div>
        )}

        {chainId && !contract && (
          <div className="alert alert-warning">
            <span>⚠️ Contract not deployed on this network. Please switch to Sepolia.</span>
          </div>
        )}

        {/* Encrypt Section */}
        <div className="divider">Encrypt</div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Value to encrypt (euint32)</span>
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="input input-bordered"
            disabled={!isReady || isEncrypting}
          />
        </div>

        <button
          onClick={handleEncrypt}
          className="btn btn-primary"
          disabled={!isReady || isEncrypting || !isConnected}
        >
          {isEncrypting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Encrypting...
            </>
          ) : (
            "Encrypt Value"
          )}
        </button>

        {encryptError && (
          <div className="alert alert-error">
            <span>Encrypt Error: {encryptError.message}</span>
          </div>
        )}

        {encryptedData && (
          <div className="mockup-code">
            <pre>
              <code>{JSON.stringify(encryptedData, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* Decrypt Section */}
        <div className="divider">Decrypt</div>
        <button
          onClick={handleDecrypt}
          className="btn btn-secondary"
          disabled={!isReady || isDecrypting || !isConnected || !encryptedData}
        >
          {isDecrypting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Decrypting...
            </>
          ) : (
            "Decrypt Value (Demo)"
          )}
        </button>

        {decryptError && (
          <div className="alert alert-error">
            <span>Decrypt Error: {decryptError.message}</span>
          </div>
        )}

        {decryptedData && (
          <div className="alert alert-success">
            <div>
              <span className="font-bold">Decrypted Result:</span>
              <pre>{JSON.stringify(decryptedData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="divider">About</div>
        <div className="text-sm opacity-70">
          <p>
            This demo showcases the <code>@fhevm/react</code> hooks:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <code>useInit()</code> - Initialize FHEVM with your wallet
            </li>
            <li>
              <code>useEncrypt()</code> - Encrypt data for on-chain computation
            </li>
            <li>
              <code>useDecrypt()</code> - Decrypt results with user signature
            </li>
            <li>
              <code>useStatus()</code> - Track FHEVM initialization status
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
