import { EncryptedCounter } from "~/components/EncryptedCounter";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-200 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            🔐 FHEVM SDK Example
          </h1>
          <p className="text-xl text-base-content/70 mb-2">
            Built with <code className="badge badge-primary badge-lg">@0xbojack/fhevm-nextjs</code>
          </p>
          <p className="text-lg text-base-content/60">
            Wagmi-like hooks for Fully Homomorphic Encryption on Ethereum
          </p>
        </div>

        {/* Demo Component */}
        <EncryptedCounter />

        {/* Info Footer */}
        <div className="mt-12 text-center text-sm text-base-content/50">
          <p>
            Learn more about FHEVM at{" "}
            <a
              href="https://docs.zama.ai/fhevm"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              docs.zama.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
