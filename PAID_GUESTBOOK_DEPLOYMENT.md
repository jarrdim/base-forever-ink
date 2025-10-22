# Paid Guestbook Contract Deployment Guide

## Overview
This guide will help you deploy the Guestbook contract that requires 1 USDC payment per signature to Base Sepolia testnet.

## Prerequisites
- MetaMask or another Web3 wallet
- Base Sepolia ETH for gas (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- Remix IDE (https://remix.ethereum.org/)

## Deployment Steps

### 1. Get Test USDC on Base Sepolia
The USDC token address on Base Sepolia is: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

You can get test USDC from:
- Circle's testnet faucet
- Aave testnet faucet
- Or bridge USDC from another testnet

### 2. Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Create a new file called `Guestbook.sol`
3. Copy the contract code from `contracts/Guestbook.sol`

### 3. Compile the Contract
1. Go to the "Solidity Compiler" tab (left sidebar)
2. Select compiler version `0.8.20` or higher
3. Click "Compile Guestbook.sol"

### 4. Deploy the Contract
1. Go to the "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask" as the environment
3. Make sure your MetaMask is connected to Base Sepolia network
4. In the constructor parameters, enter the USDC token address:
   ```
   0x036CbD53842c5426634e7929541eC2318f3dCF7e
   ```
5. Click "Deploy" and confirm the transaction in MetaMask

### 5. Verify the Contract Address
After deployment, you'll see the contract address in the Remix console. Copy this address.

### 6. Update the Frontend Configuration
1. Open `src/lib/paid-guestbook-contract.ts`
2. Replace the contract address:
   ```typescript
   export const PAID_GUESTBOOK_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS" as const;
   ```

### 7. Test the Contract

#### Test USDC Approval
1. Connect your wallet to the app
2. Click "Approve USDC Spending"
3. Confirm the transaction in MetaMask

#### Test Signing
1. Write a test message
2. Click "Sign Forever Book (1 USDC)"
3. Confirm the transaction
4. Wait for confirmation
5. Your message should appear in the "Recent Signatures" section

## Contract Functions

### User Functions
- `signGuestbook(string _content, string _username, string _tag)` - Sign the guestbook (costs 1 USDC)
- `getMessage(uint256 index)` - Get a specific message
- `getAllMessages()` - Get all messages
- `getMessagesInRange(uint256 start, uint256 end)` - Get messages in a range
- `getMessageCount()` - Get total number of messages
- `getSigningFee()` - Get the current signing fee (1 USDC)

### Owner Functions
- `withdrawFees()` - Withdraw collected USDC fees (owner only)
- `emergencyWithdraw(address token, uint256 amount)` - Emergency withdraw (owner only)

## Verification on BaseScan

To verify your contract on BaseScan:

1. Go to https://sepolia.basescan.org/
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit.a1b79de6
   - License Type: MIT
6. Paste your contract code
7. In constructor arguments, encode the USDC address:
   ```
   0x000000000000000000000000036CbD53842c5426634e7929541eC2318f3dCF7e
   ```
8. Click "Verify and Publish"

## Production Deployment (Base Mainnet)

For production deployment on Base Mainnet:

1. Use Base Mainnet USDC address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
2. Follow the same deployment steps but on Base Mainnet
3. Update the configuration file:
   ```typescript
   export const PAID_GUESTBOOK_CONTRACT_ADDRESS = "YOUR_MAINNET_CONTRACT_ADDRESS" as const;
   export const USDC_TOKEN_ADDRESS = USDC_TOKEN_ADDRESS_MAINNET;
   ```

## Troubleshooting

### "Insufficient USDC balance"
- Make sure you have at least 1 USDC in your wallet
- Check that you're on Base Sepolia network

### "Insufficient USDC allowance"
- Click the "Approve USDC Spending" button first
- Wait for the approval transaction to confirm
- Then try signing again

### "Contract not deployed"
- Make sure you've deployed the contract
- Update the contract address in the frontend configuration
- Restart the dev server

## Security Notes

- The contract owner can withdraw collected fees
- Users must approve USDC spending before signing
- All messages are permanent and cannot be deleted
- The signing fee is fixed at 1 USDC and cannot be changed

## Support

For issues or questions:
- Check the contract on BaseScan for transaction details
- Review the browser console for error messages
- Ensure you have enough ETH for gas fees
- Ensure you have enough USDC for the signing fee
