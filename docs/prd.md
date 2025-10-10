[PRD - Final Blueprint] FHEVM Universal SDK
项目名称: FHEVM Universal SDK

版本: Final

更新日期: 2025年10月9日

目标: 赢得 Zama Bounty Program (October 2025)，交付行业领先的 FHEVM 前端开发工具包。

1. 概述 (Executive Summary)
1.1. 愿景
为 Zama FHEVM 创建一个终极的前端开发工具包。它应如 wagmi 在以太坊生态中的地位一样，成为 FHEVM dApp 开发的首选，做到极简、强大且通用。

1.2. 核心问题
FHEVM 的前端集成流程分散、复杂，缺乏一个能统领全局、与框架无关的解决方案。

1.3. 解决方案
我们将交付一个以 Monorepo 形式组织的 GitHub 项目。该项目包含一个框架无关的 @fhevm/core 核心包，上层的 @fhevm/react 和 @fhevm/vue 适配包，以及一个统一的 fhevm-sdk 主包。项目将附带功能完整的示例应用、智能合约和详尽的文档，构成一个完整的、开箱即用的开发生态。

2. 交付物清单 (Final Deliverables Breakdown)
最终提交的 GitHub 仓库将包含以下所有内容：

1. 源代码 (Monorepo packages/):

智能合约 (contracts):

一个简单的 EncryptedCounter.sol 合约。

hardhat 配置与部署脚本。

SDK 核心 (core):

发布为 NPM 包: @fhevm/core。

React 适配器 (react):

发布为 NPM 包: @fhevm/react。

Vue 适配器 (vue): (加分项)

发布为 NPM 包: @fhevm/vue。

主包 (fhevm-sdk):

发布为 NPM 包: fhevm-sdk (聚合并导出 core 和 react)。

2. 示例应用 (examples/):

Next.js App: (必需) 一个功能完整的 dApp，用于演示 React SDK。

Vue App: (加分项) 一个功能完整的 dApp，用于演示 Vue SDK。

3. 文档 (Documentation):

根 README.md: 包含项目总览、架构图、开发指南。

各包 README.md: 提供每个包的详细 API 参考和使用示例。

代码内 JSDoc 注释。

4. 演示视频 (Video Walkthrough):

一个 3-5 分钟的视频，展示项目设计、安装流程和示例应用的实时操作。

5. 部署链接 (Deployment Links):

在根 README.md 中提供 Next.js 和 Vue 示例应用的线上 Vercel/Netlify 部署链接。

3. 技术架构与设计 (Technical Architecture)
3.1. 仓库设置 (Repository Setup)
严格遵循 Bounty 要求：Fork 官方的 fhevm-react-template 仓库，然后清空其内容，再初始化我们自己的 pnpm workspace Monorepo 结构。

3.2. 技术栈 (Tech Stack)
Monorepo: pnpm workspace

语言/打包: TypeScript, Tsup, Vite

合约/链交互: Hardhat, Ethers.js

测试: Vitest

版本/发布: Changesets

3.3. API 设计理念
Core (@fhevm/core): 暴露一个 FhevmClient 类，处理所有与 fhevmjs 的底层交互，做到 100% 无 UI 框架依赖。

React (@fhevm/react): 提供一个 <FhevmProvider> 和一系列 wagmi-like 的 Hooks (e.g., useEncrypt, useDecrypt)。

Vue (@fhevm/vue): 提供一个 createFhevm() 插件和一系列 Composables (e.g., useEncrypt, useDecrypt)。

4. 项目路线图与阶段划分 (Project Roadmap & Phases)
总时限: 即日起至 2025年10月30日 (为提交留出1天缓冲)

Phase 0: 基础建设 (预计 1-2 天)

[ ] 完成仓库的 Fork 与清理。

[ ] 初始化 pnpm workspace，建立所有包和示例应用的目录结构。

[ ] 完成 contracts 包的开发和部署脚本。

Phase 1: 核心逻辑 (预计 4-5 天)

[ ] 开发 @fhevm/core 包的全部功能。

[ ] 编写 Vitest 单元测试，确保核心逻辑的稳定性。

Phase 2: React 生态实现 (预计 5 天)

[ ] 开发 @fhevm/react 和 fhevm-sdk 包。

[ ] 构建 Next.js 示例应用，完整跑通“加密-上链-读取-解密”的全流程。

Phase 3: Vue 生态实现 (加分项) (预计 3-4 天)

[ ] 开发 @fhevm/vue 包。

[ ] 构建 Vue 示例应用，证明 @fhevm/core 的通用性。

Phase 4: 文档、润色与发布 (预计 4-5 天)

[ ] 撰写所有 README.md 文档。

[ ] 部署示例应用并获取公开链接。

[ ] 录制并剪辑演示视频。

[ ] 使用 Changesets 将所有 NPM 包发布。

Phase 5: 最终提交 (2025年10月31日)

[ ] 最后检查一遍仓库，确保所有链接和说明都准确无误。

[ ] 提交 GitHub 仓库链接。

5. 关键脚本 (package.json)
为满足“从根目录完成所有操作”的要求，项目根目录的 package.json scripts 字段应如下所示：

JSON

"scripts": {
  "build": "pnpm --filter \"./packages/*\" build",
  "test": "vitest",
  "dev:react": "pnpm --filter nextjs-app dev",
  "dev:vue": "pnpm --filter vue-app dev",
  "contract:compile": "pnpm --filter contracts compile",
  "contract:deploy": "pnpm --filter contracts deploy",
  "release": "pnpm build && pnpm changeset publish"
}