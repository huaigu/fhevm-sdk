/**
 * Deployed contract addresses and ABIs
 *
 * This file contains the addresses of deployed FHECounter contracts on different networks.
 * For the showcase demo, we use the contract deployed on Sepolia testnet.
 */

export const deployedContracts = {
  // Sepolia Testnet
  11155111: {
    FHECounter: {
      address: "0x269ea49ac93ae5dd7a98ee0a681a2c0396fbaf8f" as `0x${string}`,
      abi: [
        {
          inputs: [],
          name: "getCount",
          outputs: [{ internalType: "euint32", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "einput", name: "encryptedValue", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "increment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "einput", name: "encryptedValue", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "decrement",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
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
          outputs: [{ internalType: "euint32", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "einput", name: "encryptedValue", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "increment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "einput", name: "encryptedValue", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
          ],
          name: "decrement",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] as const,
    },
  },
} as const;

export type SupportedChainId = keyof typeof deployedContracts;
