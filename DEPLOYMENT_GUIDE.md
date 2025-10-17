# Base Forever Book - Blockchain Deployment Guide

## 🎯 Overview

This guide will help you deploy the Guestbook smart contract to Base blockchain and enable permanent, gasless message storage.

## 📋 Prerequisites

- A wallet with some Base ETH (for deployment only - users won't pay gas!)
- MetaMask or Coinbase Wallet browser extension
- Basic understanding of smart contract deployment

## 🚀 Quick Deployment (Recommended: Remix)

### Step 1: Open Remix IDE

1. Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)
2. Create a new file called `Guestbook.sol` in the contracts folder
3. Copy the entire content from `contracts/Guestbook.sol` in this repo
4. Paste it into the new file in Remix

### Step 2: Compile the Contract

1. Click on the "Solidity Compiler" tab (left sidebar)
2. Select compiler version `0.8.20` or higher
3. Click "Compile Guestbook.sol"
4. Wait for successful compilation ✅

### Step 3: Connect to Base Network

1. Open MetaMask/Coinbase Wallet
2. Add Base network if not already added:
   - Network Name: Base
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: `8453`
   - Currency Symbol: ETH
   - Block Explorer: `https://basescan.org`

3. Switch to Base network
4. Ensure you have some ETH for deployment

### Step 4: Deploy

1. Click "Deploy & Run Transactions" tab in Remix
2. Change "Environment" to "Injected Provider - MetaMask"
3. Confirm the connection in MetaMask (should show Base network)
4. Click "Deploy" button
5. Confirm the transaction in MetaMask
6. Wait for confirmation (~2 seconds on Base!)

### Step 5: Copy Contract Address

1. After deployment, you'll see the contract under "Deployed Contracts"
2. Copy the contract address (starts with 0x...)
3. Save this address - you'll need it!

### Step 6: Update Your Project

1. Open `src/lib/contract.ts` in your code editor
2. Replace the address on line 4:

```typescript
export const GUESTBOOK_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE" as const;
```

3. Save the file
4. Redeploy your website (if using Vercel, just push to git)

## ✅ Verify Deployment

After updating the contract address:

1. Visit your guestbook page
2. You should see a green "Contract Deployed ✓" banner
3. Connect your wallet
4. Try signing the guestbook
5. The transaction should be **gasless** (no fees!)
6. View your transaction on [BaseScan](https://basescan.org/)

## 🎉 You're Done!

Your guestbook is now:
- ✅ Storing messages permanently on Base blockchain
- ✅ Completely gasless for users
- ✅ Immutable (messages cannot be deleted)
- ✅ Transparent (anyone can verify on BaseScan)

## 🔧 Alternative Deployment Methods

### Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

Deploy:

```bash
npx hardhat run scripts/deploy.js --network base
```

### Using Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy
forge create --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY \
  contracts/Guestbook.sol:Guestbook
```

## 🆘 Troubleshooting

### "Insufficient funds" error
- You need Base ETH to deploy the contract
- Bridge ETH to Base using the [official bridge](https://bridge.base.org/)

### Contract not showing as deployed
- Double-check you updated `src/lib/contract.ts` with the correct address
- Ensure the address starts with `0x` and is 42 characters long
- Clear your browser cache and reload

### Transactions failing
- Verify the contract is deployed to Base mainnet (not testnet)
- Check that the paymaster RPC is correctly configured in `src/lib/wagmi-config.ts`
- Ensure your wallet is connected to Base network

## 📚 Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Coinbase Gasless Paymaster](https://www.coinbase.com/cloud)
- [Remix IDE Docs](https://remix-ide.readthedocs.io/)
- [BaseScan Explorer](https://basescan.org/)

## 💡 Tips

- Test on Base Sepolia testnet first if you're new to deployment
- Keep your private key secure (never commit it to git!)
- Verify your contract on BaseScan for transparency
- The owner of the contract is the deployer address

---

**Questions?** Open an issue on GitHub or reach out to the community!
