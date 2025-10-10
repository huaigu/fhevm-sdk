The Zama Bounty Program aims to inspire and incentivize the developer community to contribute to the Zama Confidential Blockchain Protocol.

Each season, we introduce a new bounty that addresses a specific challenge. With this initiative, we invite developers to collaborate with us in advancing the FHE ecosystem.

For this season, the challenge is to build an universal FHEVM SDK; a framework-agnostic frontend toolkit that helps developers run confidential dApps with ease. The prize pool for this challenge is $10,000.

Important dates
Start date: October 8, 2025
Submission deadline: October 31, 2025 (23:59, Anywhere On Earth)
Overview
Many of you have already explored our fhevm-react-template. It works, but it’s not perfect.

This season, we’re inviting you to build the next generation of that template: a universal FHEVM SDK that makes building confidential frontends simple, consistent, and developer-friendly.

This SDK should:

Be framework-agnostic (usable in Node.js, Next.js, Vue, React, or any frontend setup).
Serve as a wrapper around all required packages, so developers don’t need to worry about scattered dependencies.
Provide a wagmi-like structure to make it intuitive for web3 developers.
Enable quick setup for encryption and decryption flows while following Zama’s official SDKs and guidelines.
How to start?

Fork the repo: fhevm-react-template.
Start making changes. You’re free to delete anything and everything; even start from a blank slate — but make sure you preserve the commit history by forking first.
⚠️ Submissions that are not forks will not be considered.

Tips:

‍Focus on the FHEVM SDK. The Next.js code should only serve as a showcase/example of how the SDK works, not as the main deliverable.
Help yourself with what's already written in: packages/fhevm-sdk.‍
Check out GitHub issues for inspiration and community feedback.
Your end result should showcase a complete setup that allows developers to:
Install all packages from root.
Compile, deploy, and generate an ABI from the Solidity contract.
Start the desired frontend template from root
Requirements
Build a universal SDK package (fhevm-sdk) that:

Can be imported into any dApp.
Provides utilities for initialization, encrypted inputs, and decryption flows (userDecrypt with EIP-712 signing + publicDecrypt).
Exposes a wagmi-like modular API structure (hooks/adapters for React, but keep the core independent).
Makes reusable components that cover different encryption/decryption scenarios.
Keep it clean, reusable, and extensible.

Not planning to participate? You can still share suggestions on the GitHub issue board.

Bonus points (Optional):

These are not necessary for winning. Please make sure you really focus on the fhevm-sdk structure first.

Show the SDK working in multiple environments (e.g., Vue, plain Node.js, Next.js).
Provide clear documentation and code samples for quick setup.
Include developer-friendly command lines that minimize setup time (<10 lines of code to get started).
Judging criteria
Submissions will be judged on:

Usability: How easy is it for a developer to install and use the SDK (quick setup, minimal boilerplate)?
Completeness: Does it cover the full flow of FHEVM usage; initialization, encrypted inputs, decryption, and contract interactions?
Reusability: Are components and utilities clean, modular, and adaptable across different frameworks (React, Vue, Node.js)?
Documentation & Clarity: Is the SDK well-documented with clear examples, making onboarding straightforward for new developers?
Creativity: Extra points if the SDK is showcased in multiple environments or in innovative use cases that highlight FHEVM’s potential.
Deliverables
GitHub repo with the updated universal FHEVM SDK.
Example template(s) showing integration (Next.js showcase required, others optional).
Video walkthrough showcasing setup and design choices.
Deployment link (or links in the case of multiple templates) linked in the README file