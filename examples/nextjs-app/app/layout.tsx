import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProviders } from "~/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "FHEVM SDK Example - Next.js",
  description: "Demonstration of @0xbojack/fhevm-nextjs hooks for Fully Homomorphic Encryption",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
