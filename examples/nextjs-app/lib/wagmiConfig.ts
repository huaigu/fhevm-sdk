import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { sepolia, hardhat } from "wagmi/chains";

/**
 * Wagmi configuration for the FHEVM SDK example
 * Supports Sepolia testnet and local Hardhat network
 */
export const wagmiConfig = getDefaultConfig({
  appName: "FHEVM SDK Example",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "default_project_id",
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
        : "https://ethereum-sepolia-rpc.publicnode.com" // PublicNode Sepolia RPC
    ),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
