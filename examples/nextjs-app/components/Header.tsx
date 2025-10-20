"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Header component with wallet connection
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <span>🔐</span>
            <span className="text-primary">FHEVM SDK</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
