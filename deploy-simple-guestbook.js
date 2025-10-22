import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';

dotenv.config();

async function main() {
    console.log('🚀 Starting SimpleGuestbook contract deployment to Base Sepolia...');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const network = await provider.getNetwork();
    const isTestnet = network.chainId === 84532n; // Base Sepolia
    
    console.log(`📍 Deploying to Base Sepolia testnet`);
    
    // Load compilation output
    const compilationOutput = JSON.parse(fs.readFileSync('simple-compilation-output.json', 'utf8'));
    const { bytecode, abi } = compilationOutput;
    
    // Setup wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('📝 Deploying from address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log('💰 Account balance:', balanceInEth, 'ETH');
    
    if (parseFloat(balanceInEth) < 0.0002) {
        console.log('⚠️  Insufficient balance! Get test ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
        process.exit(1);
    }
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    console.log('Deploying SimpleGuestbook contract (no USDC required)...');
    
    // Deploy without constructor parameters
    const contract = await contractFactory.deploy();
    
    console.log('Transaction hash:', contract.deploymentTransaction().hash);
    console.log('Waiting for deployment confirmation...');
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ SimpleGuestbook contract deployed successfully!');
    console.log('Contract address:', contractAddress);
    
    // Test the contract
    const messageCount = await contract.getMessageCount();
    console.log('Initial message count:', messageCount.toString());
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        contractType: 'SimpleGuestbook',
        network: 'base-sepolia',
        chainId: network.chainId.toString(),
        deploymentHash: contract.deploymentTransaction().hash,
        deployedAt: new Date().toISOString(),
        deployer: wallet.address,
        gasRequired: false,
        usdcRequired: false
    };
    
    fs.writeFileSync('./simple-deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('Deployment info saved to simple-deployment-info.json');
    
    console.log('🎉 SimpleGuestbook is ready for gas-free transactions!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });