# Automata Relayer Assignment

## 🚀 Getting Started
After cloning the repo, please follow the instructions for setting up the project

### 1. Install Dependencies
At the project root directory run the following commands
```bash
npm install
```
or
```bash
yarn install
```

### 2. Contracts deployment
Create .env by copying .env.example and add the your `PRIV_KEY` and your `INFURA_API_KEY`
```bash
cp contracts/.env.example contracts/.env
```
After that, deploy the contracts by running the following command. You can substitute `[NETWORK]` on where to deploy the contract, e.g `Goerli`, `Sepolia`, etc..
```bash
cd contract && npx hardhat run scripts/deploy.ts --network [NETWORK]
```
Or change directory to `contracts` and run the following command and it should work the same
```bash
npx hardhat run scripts/deploy.ts --network [NETWORK]
```

### 2. Setting up the Relayer Server
Create .env by copying .env.example
```bash
cp relayer/.env.example relayer/.env
```
And add your admin private key to the `PRIV_KEY` and the `RECEIVER_CONTRACT` as well which is the deployed address of the receiver contract. Then, you can now start the relayer server by running the command
```bash
yarn dev
```
or
```bash
npm run dev
```

### 3. Setting up the Frontend
Create .env by copying .env.example and fill in all the required variables
```bash
cp frontend/.env.example frontend/.env
```
After that you can now start the React UI frontend by running the command
```bash
yarn start
```
or
```bash
npm start
```

## 📚 Technologies
- Solidity
- Hardhat
- React
- Node.js
- Express
- TypeScript
- Ethers.js

## 📇 Contract Addresses
You also try this pre-deployed contract
```bash
https://goerli.etherscan.io/address/0xF83688216A125196CB7AFafa7fb9E3bD141B1fF6
```