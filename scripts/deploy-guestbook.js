const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Contract bytecode and ABI (you'll need to compile the contract first)
const GUESTBOOK_ABI = require('./GuestbookABI.json');

// Base Sepolia RPC URL
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// USDC address on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

async function deployGuestbook() {
    console.log('🚀 Starting Guestbook deployment to Base Sepolia...\n');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log('📋 Deployment Details:');
    console.log('Deployer Address:', wallet.address);
    console.log('Network: Base Sepolia');
    console.log('USDC Token Address:', USDC_ADDRESS);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Deployer Balance:', ethers.formatEther(balance), 'ETH\n');

    if (balance < ethers.parseEther('0.001')) {
        throw new Error('Insufficient ETH balance. Need at least 0.001 ETH for deployment.');
    }

    // Read compiled contract
    const contractPath = path.join(__dirname, '../contracts/GuestbookOptimized.sol');
    console.log('📄 Contract:', contractPath);

    // You need to compile the contract first using:
    // npx hardhat compile
    // or use Remix to get the bytecode

    console.log('\n⚠️  IMPORTANT: Before running this script:');
    console.log('1. Compile the contract using Remix or Hardhat');
    console.log('2. Save the bytecode to GuestbookBytecode.json');
    console.log('3. Save the ABI to GuestbookABI.json');
    console.log('\nFor now, please use Remix for deployment:');
    console.log('1. Go to https://remix.ethereum.org/');
    console.log('2. Create a new file and paste the contract from contracts/GuestbookOptimized.sol');
    console.log('3. Compile with Solidity 0.8.20');
    console.log('4. Deploy using Injected Provider (MetaMask on Base Sepolia)');
    console.log('5. Constructor parameter:', USDC_ADDRESS);
    console.log('6. Copy the deployed contract address');
    console.log('7. Update PAID_GUESTBOOK_CONTRACT_ADDRESS in src/lib/paid-guestbook-contract.ts\n');
}

// Estimate gas for deployment
async function estimateDeploymentCost() {
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Estimated gas for contract deployment: ~2,000,000 gas
    const estimatedGas = 2000000n;
    const deploymentCost = gasPrice * estimatedGas;

    console.log('💰 Estimated Deployment Cost:');
    console.log('Gas Price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
    console.log('Estimated Gas:', estimatedGas.toString());
    console.log('Total Cost:', ethers.formatEther(deploymentCost), 'ETH');

    // Convert to USD (assuming ETH price, you'd need to fetch real price)
    const ethPriceUSD = 2500; // Update with current ETH price
    const costUSD = parseFloat(ethers.formatEther(deploymentCost)) * ethPriceUSD;
    console.log('Estimated Cost in USD: $' + costUSD.toFixed(4));

    if (costUSD > 0.20) {
        console.log('\n⚠️  Cost exceeds $0.20 target. Consider:');
        console.log('1. Waiting for lower gas prices');
        console.log('2. Further optimizing the contract');
        console.log('3. Using a gas optimizer during compilation');
    } else {
        console.log('\n✅ Cost is within $0.20 budget!');
    }
}

// Run estimation
estimateDeploymentCost()
    .then(() => deployGuestbook())
    .catch(console.error);

module.exports = { deployGuestbook, estimateDeploymentCost };
