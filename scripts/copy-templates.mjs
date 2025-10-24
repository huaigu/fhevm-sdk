import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const EXAMPLES_DIR = path.join(ROOT, 'examples');
const HARDHAT_DIR = path.join(ROOT, 'packages/hardhat');
const TEMPLATES_DIR = path.join(ROOT, 'packages/create-fhevm-dapp/templates');
const HARDHAT_OVERRIDE_DIR = path.join(ROOT, 'packages/create-fhevm-dapp/template-overrides/hardhat');

const FRONTEND_FRAMEWORKS = {
  'nextjs-app': 'nextjs',
  'react-app': 'react',
  'vue-app': 'vue',
};

const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.next',
  'build',
  '.turbo',
  'tsconfig.tsbuildinfo',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  '.git',
  'cache',
  'artifacts',
  'typechain-types',
  'deployments',
  '.vscode',
  'fhevmTemp',
];

async function prepareTemplates() {
  console.log('📦 Preparing monorepo templates...\n');

  await fs.ensureDir(path.join(TEMPLATES_DIR, 'base'));
  await fs.ensureDir(path.join(TEMPLATES_DIR, 'frontend'));
  await fs.ensureDir(path.join(TEMPLATES_DIR, 'hardhat'));
  console.log('✅ Template directories created\n');

  console.log('📁 Base templates (manually created):');
  const baseFiles = await fs.readdir(path.join(TEMPLATES_DIR, 'base'));
  baseFiles.forEach(file => console.log(`  ✓ ${file}`));
  console.log();

  console.log('📁 Copying frontend templates from examples/...');
  for (const [source, target] of Object.entries(FRONTEND_FRAMEWORKS)) {
    const sourcePath = path.join(EXAMPLES_DIR, source);
    const targetPath = path.join(TEMPLATES_DIR, 'frontend', target);

    if (!(await fs.pathExists(sourcePath))) {
      console.log(`  ⚠️  Skipping ${source} (not found)`);
      continue;
    }

    await fs.remove(targetPath);

    await fs.copy(sourcePath, targetPath, {
      filter: src => {
        const relativePath = path.relative(sourcePath, src);
        return !EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern));
      },
    });

    const pkgPath = path.join(targetPath, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = 'frontend';
      pkg.private = true;

      if (pkg.dependencies) {
        for (const [dep, version] of Object.entries(pkg.dependencies)) {
          if (version === 'workspace:*') {
            pkg.dependencies[dep] = '{{FHEVM_VERSION}}';
          }
        }
      }

      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    console.log(`  ✅ Copied ${source} → frontend/${target}`);
  }
  console.log();

  console.log('📁 Copying Hardhat template from packages/hardhat/...');
  const hardhatSource = path.join(HARDHAT_DIR);
  const hardhatTarget = path.join(TEMPLATES_DIR, 'hardhat');

  await fs.remove(hardhatTarget);

  await fs.copy(hardhatSource, hardhatTarget, {
    filter: src => {
      const relativePath = path.relative(hardhatSource, src);
      return !EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern));
    },
  });

  const hardhatPkgPath = path.join(hardhatTarget, 'package.json');
  if (await fs.pathExists(hardhatPkgPath)) {
    const pkg = await fs.readJson(hardhatPkgPath);
    pkg.name = 'hardhat';
    pkg.private = true;
    pkg.scripts = pkg.scripts || {};

    if (pkg.scripts['deploy:localhost']) {
      pkg.scripts['deploy:localhost'] = 'hardhat deploy --network localhost && pnpm run --silent generate:abis';
    }

    if (pkg.scripts['deploy:sepolia']) {
      pkg.scripts['deploy:sepolia'] = 'hardhat deploy --network sepolia && pnpm run --silent generate:abis';
    }

    pkg.scripts['generate:abis'] = 'ts-node --project tsconfig.json ./scripts/generateTsAbis.ts';

    await fs.writeJson(hardhatPkgPath, pkg, { spaces: 2 });
  }

  if (await fs.pathExists(HARDHAT_OVERRIDE_DIR)) {
    await fs.copy(HARDHAT_OVERRIDE_DIR, hardhatTarget, { overwrite: true });
  }

  console.log('  ✅ Copied packages/hardhat → templates/hardhat');
  console.log();

  console.log('🎉 All templates prepared successfully!\n');
  console.log('Template structure:');
  console.log('  templates/');
  console.log('  ├── base/           # Root configuration files');
  console.log('  ├── frontend/       # Framework templates');
  console.log('  │   ├── nextjs/');
  console.log('  │   ├── react/');
  console.log('  │   └── vue/');
  console.log('  └── hardhat/        # Smart contracts');
}

prepareTemplates().catch(error => {
  console.error('❌ Error preparing templates:', error);
  process.exit(1);
});
