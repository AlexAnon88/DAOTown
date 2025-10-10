# DAOTown - Decentralized Autonomous Organizations Made Easy

Create and manage DAOs in minutes on **U2U Network**.

DAOTown revolutionizes DAO management by breaking down technical barriers for seamless governance and tokenomics. Simplifying decentralized governance for everyone.

## 🌐 Deployment

**Network**: U2U Network Nebulas (Testnet)  
**Chain ID**: 2484  
**Status**: ✅ Live

📋 **See [DEPLOYED_CONTRACTS.txt](./DEPLOYED_CONTRACTS.txt) for contract addresses and explorer links.**

## Tech Stack 🧰

- Solidity
- ethers.js
- Next.js
- React.js
- Foundry
- OpenZeppelin
- RainbowKit
- TypeScript
- JavaScript
- Chakra UI
- Lighthouse Storage (IPFS gateway)
- U2U Network (EVM-compatible)
- MACI (Minimal Anti-Collusion Infrastructure)

## Foundry Setup 🚧

### Prerequisites

Before you begin, ensure you have the following installed:

- Follow the installation instructions in the [Foundry documentation](https://book.getfoundry.sh/).

For Windows users, it is recommended to use Windows Subsystem for Linux (WSL) for the Foundry setup.

### Getting Started

#### Cloning the Repository

1. Clone the DAOTown repository:

```bash
git clone https://github.com/AlexAnon88/DAOTown
```

2. Navigate to the `contracts/` directory:

```bash
cd DAOTown/contracts/
```

#### Setting Up Environment Variables

1. Create a file named `.env` in the contracts directory.

2. Configure the `.env` file according to the provided `.env.example` file.

#### Installing Dependencies

Install the necessary dependencies for the Foundry setup:

```bash
forge install
```

#### Building the Project

Build the project with the following command:

```bash
make build
```

#### Deployment

The Makefile is set up for deployment on U2U Network.

**Deploy to U2U Testnet (Nebulas):**
```bash
make deploy ARGS="--network u2u_testnet"
```

**Deploy to U2U Mainnet (Solaris):**
```bash
make deploy ARGS="--network u2u_mainnet"
```

## Frontend Setup 🚧

**Note:** Update the compiled ABIs of the contracts in the `/frontend/src/utils/abis/` directory.

1. From the root, navigate to the `frontend/` directory:

```bash
cd DAOTown/frontend/
```

2. Create a `.env` file in the root directory of the project:

```bash
touch .env
```

3. Refer to `.env.example` to update the `.env` file.

4. Install Dependencies:

```bash
yarn
```

5. Run the project at `localhost:3000`:

```bash
yarn run dev
```

## 🔑 Environment Setup

### **Contracts (.env)**
```bash
PRIVATE_KEY=your_private_key_without_0x
```

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_DAOMANAGER_ADDRESS=0x8c2786cfc456232a4017658481C71a3FF3676418
NEXT_PUBLIC_CREATE_GOVERNANACE_ADDRESS=0xbDD418Ea726a0b53662E42429BDAB867Ac746aAe
NEXT_PUBLIC_RPC_URL=https://rpc-nebulas-testnet.u2u.xyz
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

Get your Lighthouse API key from: https://files.lighthouse.storage/

## ⚡ Key Features

- **Create DAOs**: Deploy governance tokens and DAOs in minutes
- **Token-Gated Access**: Set joining and proposal thresholds
- **Voting Systems**: Standard and Quadratic Voting (QV)
- **IPFS Storage**: Decentralized document storage
- **Discord Integration**: Automatic DAO channel creation
- **MACI Support**: Privacy-preserving voting (optional)
