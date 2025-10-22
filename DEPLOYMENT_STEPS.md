# Guestbook Contract Deployment Guide
## Deploy to Base Sepolia with Optimized Gas (<$0.20)

### Prerequisites
1. ✅ MetaMask wallet installed and configured
2. ✅ Base Sepolia network added to MetaMask
3. ✅ At least 0.002 ETH on Base Sepolia (for gas fees)
4. ✅ Your wallet: `0xe918f1da0C3A9AC904f10f8B9Ee42C545360d4D7`

### Get Base Sepolia ETH
Get free testnet ETH from:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- https://docs.base.org/tools/network-faucets

---

## Step 1: Prepare for Deployment

### Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Create a new workspace or use the default workspace

### Create the Contract File
1. In the File Explorer, create a new file: `GuestbookOptimized.sol`
2. Copy the contract code from `contracts/GuestbookOptimized.sol`
3. Paste it into Remix

---

## Step 2: Compile the Contract

1. Go to the **"Solidity Compiler"** tab (left sidebar)
2. Settings:
   - **Compiler Version**: `0.8.20` or higher
   - **EVM Version**: `paris` (default)
   - **Optimization**: Enable with **200** runs
   - **Auto compile**: Check this box
3. Click **"Compile GuestbookOptimized.sol"**
4. You should see a green checkmark ✅

### Gas Optimization Settings
The contract is already optimized with:
- ✅ `uint32` for timestamps (saves ~15,000 gas per entry)
- ✅ `immutable` variables for owner and USDC token
- ✅ Efficient storage patterns
- ✅ Minimal event data

---

## Step 3: Check Gas Estimation

Before deploying, Remix will show estimated gas costs:
- Expected deployment gas: ~1,800,000 - 2,200,000 gas
- Base Sepolia gas price: ~0.001 gwei (very low)
- **Estimated cost: $0.005 - $0.015** ✅ (well under $0.20)

---

## Step 4: Deploy the Contract

### Connect MetaMask
1. Go to the **"Deploy & Run Transactions"** tab
2. Set **Environment** to: `Injected Provider - MetaMask`
3. MetaMask will popup - Connect your wallet
4. Ensure it shows **Base Sepolia** network
5. Confirm your wallet address is shown

### Deploy
1. In the **"Contract"** dropdown, select `Guestbook`
2. In the **"Deploy"** section, enter constructor parameter:
   ```
   0x036CbD53842c5426634e7929541eC2318f3dCF7e
   ```
   (This is the USDC token address on Base Sepolia)

3. Click **"transact"** (or **"Deploy"**)
4. MetaMask will popup with transaction details:
   - **Check the gas fee** - should be < $0.05
   - Click **"Confirm"**

5. Wait for confirmation (usually 2-10 seconds)

### Verify Deployment
Once deployed, you'll see:
- ✅ Contract address in the Remix console
- ✅ Deployed contract under "Deployed Contracts" section
- ✅ Green checkmark in MetaMask

**Copy the contract address!** Example: `0x1234...5678`

---

## Step 5: Verify Contract on BaseScan

1. Go to https://sepolia.basescan.org/
2. Search for your contract address
3. Click **"Contract"** tab
4. Click **"Verify and Publish"**
5. Settings:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.20+commit.a1b79de6
   - **License**: MIT
6. Paste your contract code (entire file)
7. **Constructor Arguments ABI-encoded**:
   ```
   0x000000000000000000000000036cbd53842c5426634e7929541ec2318f3dcf7e
   ```
8. Click **"Verify and Publish"**

---

## Step 6: Update Frontend Configuration

### Update Contract Address
1. Open `src/lib/paid-guestbook-contract.ts`
2. Replace the contract address:
   ```typescript
   export const PAID_GUESTBOOK_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE" as const;
   ```

### Example:
```typescript
export const PAID_GUESTBOOK_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" as const;
```

---

## Step 7: Test the Deployment

### Restart Development Server
```bash
npm run dev
```

### Test Flow
1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve connection in MetaMask

2. **Check USDC Balance**
   - You need test USDC to sign
   - Get test USDC from faucets or Aave

3. **Approve USDC** (if needed)
   - Click "Approve USDC Spending"
   - Confirm in MetaMask
   - Wait for confirmation

4. **Sign Guestbook**
   - Enter a test message
   - Click "Sign Forever Book (1 USDC)"
   - Confirm transaction (~$0.01 gas)
   - Wait for confirmation

5. **Verify**
   - Check "Recent Signatures" section
   - Your message should appear with your wallet address
   - Check on BaseScan to see the transaction

---

## Step 8: Update API Endpoints (if needed)

If you're using a backend API, update the contract address in:

### Backend Configuration
```javascript
// server/config.js or similar
export const GUESTBOOK_CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
```

### Database Schema
If storing contract interactions, update:
```javascript
// Ensure your DB schema includes:
{
  contractAddress: 'YOUR_CONTRACT_ADDRESS',
  network: 'base-sepolia',
  // ... other fields
}
```

---

## Deployment Cost Breakdown

### Estimated Costs (Base Sepolia)
| Item | Gas | Cost (ETH) | Cost (USD) |
|------|-----|------------|------------|
| Deployment | ~2M gas | 0.002 ETH | ~$0.005 |
| First Sign | ~150k gas | 0.00015 ETH | ~$0.0004 |
| Subsequent Signs | ~100k gas | 0.0001 ETH | ~$0.00025 |

✅ **Total deployment cost: ~$0.005 - $0.015** (95%+ under budget)

---

## Troubleshooting

### "Out of Gas" Error
- Increase gas limit in MetaMask
- Default 2,500,000 should be sufficient

### "Insufficient Funds"
- Get more Base Sepolia ETH from faucet
- You need ~0.002 ETH minimum

### "USDC Transfer Failed"
- Make sure you have test USDC
- Approve USDC spending first
- Check allowance with contract

### Contract Not Responding
- Verify contract on BaseScan
- Check if contract address is correct in frontend
- Restart development server

---

## Post-Deployment Checklist

- [ ] Contract deployed to Base Sepolia
- [ ] Contract verified on BaseScan
- [ ] Contract address updated in `paid-guestbook-contract.ts`
- [ ] Development server restarted
- [ ] Test transaction successful
- [ ] Message appears in "Recent Signatures"
- [ ] Git commit with contract address
- [ ] Deploy cost documented (should be < $0.20 ✅)

---

## Production Deployment (Future)

When deploying to Base Mainnet:
1. Use mainnet USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
2. Update frontend to use mainnet contract
3. Deployment cost will be similar (~$5-15 on mainnet)
4. Consider using Gnosis Safe for contract ownership

---

## Support & Resources

- Base Sepolia Explorer: https://sepolia.basescan.org/
- Base Documentation: https://docs.base.org/
- Remix IDE: https://remix.ethereum.org/
- Base Discord: https://discord.gg/buildonbase

---

**Ready to deploy? Follow the steps above and your contract will be live in ~5 minutes! 🚀**
