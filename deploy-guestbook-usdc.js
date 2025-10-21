import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';

dotenv.config();

async function main() {
    console.log('🚀 Starting USDC-enabled Guestbook contract deployment to Base Sepolia...');
    
    // Base Sepolia testnet USDC contract address
    const USDC_TESTNET_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const network = await provider.getNetwork();
    const isTestnet = network.chainId === 84532n; // Base Sepolia
    
    const usdcAddress = USDC_TESTNET_ADDRESS;
    
    console.log(`📍 Deploying to Base Sepolia testnet`);
    console.log(`💰 Using USDC address: ${usdcAddress}`);
    
    // Load compilation output
    const compilationOutput = JSON.parse(fs.readFileSync('compilation-output.json', 'utf8'));
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
    
    console.log('Deploying Guestbook contract with USDC payment...');
    
    // Deploy with USDC address as constructor parameter
    const contract = await contractFactory.deploy(usdcAddress);
    
    console.log('Transaction hash:', contract.deploymentTransaction().hash);
    console.log('Waiting for deployment confirmation...');
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Guestbook contract deployed successfully!');
    console.log('Contract address:', contractAddress);
    
    // Verify the USDC address is set correctly
    const setUsdcAddress = await contract.getUSDCAddress();
    console.log('USDC token address in contract:', setUsdcAddress);
    
    // Get the signing fee
    const signingFee = await contract.getSigningFee();
    console.log('Signing fee:', ethers.formatUnits(signingFee, 6), 'USDC');
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        usdcAddress: usdcAddress,
        signingFee: signingFee.toString(),
        network: isTestnet ? 'base-sepolia' : 'base-mainnet',
        chainId: network.chainId.toString(),
        deploymentHash: contract.deploymentTransaction().hash,
        deployedAt: new Date().toISOString(),
        deployer: wallet.address
    };
    
    fs.writeFileSync('./deployment-info-usdc.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('Deployment info saved to deployment-info-usdc.json');
    
    // Update the main deployment info file
    fs.writeFileSync('./deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('Updated main deployment-info.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });