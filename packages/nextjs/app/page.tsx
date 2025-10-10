import { EncryptedCounterDemo } from "~~/components/EncryptedCounterDemo";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0 max-w-4xl mx-auto py-8">
      <div className="text-center w-full">
        <h1 className="text-4xl font-bold mb-4">🔐 FHEVM SDK Showcase</h1>
        <p className="text-lg opacity-70">
          Built with <code className="badge badge-primary">@fhevm/react</code> - Wagmi-like hooks for Fully Homomorphic Encryption
        </p>
      </div>
      <EncryptedCounterDemo />
    </div>
  );
}
