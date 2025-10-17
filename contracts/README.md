# Guestbook Smart Contract

## Deployment Instructions

### Prerequisites
- A wallet with Base ETH for deployment
- Hardhat, Foundry, or Remix for deployment

### Contract Address
After deployment, update the contract address in `src/lib/contract.ts`

### Deploy with Remix (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file called `Guestbook.sol` and paste the contract code
3. Compile the contract (Solidity version ^0.8.20)
4. Connect to Base network via MetaMask/Coinbase Wallet
5. Deploy the contract
6. Copy the deployed contract address

### Deploy with Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize hardhat
npx hardhat init

# Add Base network to hardhat.config.js
# Deploy
npx hardhat run scripts/deploy.js --network base
```

### Deploy with Foundry

```bash
# Install foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy
forge create --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY \
  contracts/Guestbook.sol:Guestbook
```

## After Deployment

1. Copy your contract address
2. Update `src/lib/contract.ts` with the contract address
3. The contract is now live and ready to accept gasless signatures!

## Features

- ✅ Permanent message storage on Base blockchain
- ✅ Gasless transactions via Coinbase Paymaster
- ✅ Username and tag support
- ✅ Cannot delete messages (permanent record)
- ✅ Efficient message retrieval with pagination
