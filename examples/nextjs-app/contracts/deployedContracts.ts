/**
 * Deployed contract addresses and ABIs
 *
 * This file contains the addresses of deployed FHECounter contracts on different networks.
 * For the showcase demo, we use the contract deployed on Sepolia testnet.
 */

const deployedContracts = {
  // Sepolia Testnet
  11155111: {
    FHECounter: {
      address: "0x4624Ef3b9131C0D6407Ff5AFa175e649A5b0610D" as `0x${string}`,
      abi: [
        {
          inputs: [],
          name: "getCount",
          outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "increment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "decrement",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "requestDecryptCount",
          outputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "requestId", type: "uint256" },
            { internalType: "bytes", name: "cleartexts", type: "bytes" },
            { internalType: "bytes", name: "decryptionProof", type: "bytes" },
          ],
          name: "callbackDecryptCount",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          name: "getDecryptedCount",
          outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          name: "isDecryptionCompleted",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          name: "getDecryptionRequester",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "requestId", type: "uint256" },
            { indexed: true, internalType: "address", name: "requester", type: "address" },
          ],
          name: "DecryptionRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "requestId", type: "uint256" },
            { indexed: false, internalType: "uint32", name: "decryptedValue", type: "uint32" },
          ],
          name: "DecryptionCompleted",
          type: "event",
        },
      ] as const,
    },
  },
  // Local Hardhat Network (for development)
  31337: {
    FHECounter: {
      address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      abi: [
        {
          inputs: [],
          name: "getCount",
          outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "increment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "decrement",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "requestDecryptCount",
          outputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "requestId", type: "uint256" },
            { internalType: "bytes", name: "cleartexts", type: "bytes" },
            { internalType: "bytes", name: "decryptionProof", type: "bytes" },
          ],
          name: "callbackDecryptCount",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          name: "getDecryptedCount",
          outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          name: "isDecryptionCompleted",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
          name: "getDecryptionRequester",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "requestId", type: "uint256" },
            { indexed: true, internalType: "address", name: "requester", type: "address" },
          ],
          name: "DecryptionRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "requestId", type: "uint256" },
            { indexed: false, internalType: "uint32", name: "decryptedValue", type: "uint32" },
          ],
          name: "DecryptionCompleted",
          type: "event",
        },
      ] as const,
    },
  },
} as const;

export default deployedContracts;
export { deployedContracts };
export type SupportedChainId = keyof typeof deployedContracts;
