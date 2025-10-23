import fs from "fs";
import path from "path";
import prettier from "prettier";

type ContractDeclaration = Record<
  string,
  {
    address: string;
    abi: unknown[];
  }
>;

const HARDHAT_DIR = path.resolve(__dirname, "..");
const DEPLOYMENTS_DIR = path.resolve(HARDHAT_DIR, "deployments");
const FRONTEND_DIR = path.resolve(__dirname, "../../frontend");
const CONTRACT_PATH_OPTIONS = [
  ["contracts", "deployedContracts.ts"],
  ["src", "contracts", "deployedContracts.ts"],
];
const TARGET_FILE = resolveTargetFile();

function resolveTargetFile() {
  for (const segments of CONTRACT_PATH_OPTIONS) {
    const candidate = path.resolve(FRONTEND_DIR, ...segments);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(FRONTEND_DIR, "contracts/deployedContracts.ts");
}

const headerComment = `/**
 * This file is auto-generated.
 * Run \`pnpm generate:abis\` after each deployment.
 */
`;

function getDirectories(directoryPath: string) {
  return fs.existsSync(directoryPath)
    ? fs
        .readdirSync(directoryPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
    : [];
}

function getContractFiles(directoryPath: string) {
  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
    .map(entry => entry.name.replace(".json", ""));
}

function readChainId(chainDirectory: string) {
  const chainIdFile = path.resolve(chainDirectory, ".chainId");
  if (fs.existsSync(chainIdFile)) {
    return fs.readFileSync(chainIdFile, "utf8").trim();
  }
  return path.basename(chainDirectory);
}

function collectContracts(): Record<string, ContractDeclaration> {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    throw new Error("No deployments found. Run a Hardhat deployment before generating ABIs.");
  }

  const chains = getDirectories(DEPLOYMENTS_DIR);
  const deployments: Record<string, ContractDeclaration> = {};

  for (const chainFolder of chains) {
    const chainPath = path.resolve(DEPLOYMENTS_DIR, chainFolder);
    const chainId = readChainId(chainPath);
    const contracts: ContractDeclaration = {};

    for (const contractName of getContractFiles(chainPath)) {
      const contractPath = path.resolve(chainPath, `${contractName}.json`);
      const { address, abi } = JSON.parse(fs.readFileSync(contractPath, "utf8"));
      contracts[contractName] = { address, abi };
    }

    if (Object.keys(contracts).length > 0) {
      deployments[chainId] = contracts;
    }
  }

  return deployments;
}

async function writeContractsFile(declarations: Record<string, ContractDeclaration>) {
  const targetDir = path.dirname(TARGET_FILE);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const body = `
const deployedContracts = ${JSON.stringify(declarations, null, 2)} as const;

export default deployedContracts;
export { deployedContracts };
export type SupportedChainId = keyof typeof deployedContracts;
`;

  const formatted = await prettier.format(`${headerComment}${body}`, { parser: "typescript" });
  fs.writeFileSync(TARGET_FILE, formatted);
  console.log(`Updated frontend contract declarations at ${path.relative(process.cwd(), TARGET_FILE)}`);
}

async function main() {
  const deployments = collectContracts();

  if (Object.keys(deployments).length === 0) {
    console.warn("No contract deployments found. Skipping contracts file update.");
    return;
  }

  await writeContractsFile(deployments);
}

main().catch(error => {
  console.error("Failed to generate TypeScript ABIs:", error);
  process.exit(1);
});
