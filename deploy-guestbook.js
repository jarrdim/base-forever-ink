import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';

dotenv.config();

async function main() {
    console.log('🚀 Starting Guestbook contract deployment to Base Sepolia...');

    // Load compilation output
    const compilationOutput = JSON.parse(fs.readFileSync('compilation-output.json', 'utf8'));
    const { bytecode, abi } = compilationOutput;

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
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

    try {
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

        // Get current gas price
        const feeData = await provider.getFeeData();
        console.log('Current gas price:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'gwei');

        // Estimate gas for deployment
        const estimatedGas = await contractFactory.getDeployTransaction().then(tx => 
            provider.estimateGas(tx)
        );
        console.log('Estimated gas:', estimatedGas.toString());

        // Add 20% buffer to estimated gas
        const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);
        const gasPrice = feeData.gasPrice;

        // Calculate estimated cost
        const estimatedCost = gasLimit * gasPrice;
        const estimatedCostInEth = ethers.formatEther(estimatedCost);
        console.log('Estimated deployment cost:', estimatedCostInEth, 'ETH');

        console.log('🔄 Deploying Guestbook contract...');

        // Deploy the contract
        const contract = await contractFactory.deploy({
            gasLimit: gasLimit,
            gasPrice: gasPrice
        });

        console.log('📤 Transaction hash:', contract.deploymentTransaction().hash);
        console.log('⏳ Waiting for deployment confirmation...');

        // Wait for the transaction to be mined
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log('✅ Guestbook contract deployed successfully!');
        console.log('📍 Contract address:', contractAddress);
        
        // Get deployment receipt for gas usage info
        const receipt = await contract.deploymentTransaction().wait();
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        console.log('💰 Total cost:', ethers.formatEther(receipt.gasUsed * receipt.gasPrice), 'ETH');

        // Save deployment info
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: 'Base Sepolia',
            deploymentHash: contract.deploymentTransaction().hash,
            gasUsed: receipt.gasUsed.toString(),
            totalCost: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('💾 Deployment info saved to deployment-info.json');

        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Update src/lib/contract.ts with the new contract address');
        console.log('2. Update the network configuration to Base Sepolia');
        console.log('3. Test the application with the deployed contract');

        return contractAddress;

    } catch (error) {
        console.log('❌ Deployment error:', error.message);
        if (error.reason) {
            console.log('💡 Reason:', error.reason);
        }
        process.exit(1);
    }
}

main().catch(console.error);