"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Header component with wallet connection
 */
export function Header() {
  return (
    <header className="navbar bg-base-100 shadow-lg px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost text-xl font-bold">
            <span className="text-primary">🔐</span>
            FHEVM SDK
          </a>
        </div>
        <div className="flex-none">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
