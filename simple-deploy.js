import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

async function main() {
    console.log('🚀 Starting simple contract deployment to Base Sepolia...');

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
        // Simple contract bytecode - just a basic contract that stores owner
        const contractBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610150806100606000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638da5cb5b1461003b578063893d20e814610059575b600080fd5b610043610077565b6040516100509190610098565b60405180910390f35b61006161009b565b60405161006e9190610098565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100d3826100b3565b9050919050565b6100e3816100c8565b82525050565b60006020820190506100fe60008301846100da565b9291505056fea2646970667358221220c7b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b3c8b364736f6c63430008130033";

        // Get current gas price
        const feeData = await provider.getFeeData();
        console.log('Current gas price:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'gwei');

        // Deploy with conservative settings
        const gasLimit = 300000; // Lower gas limit for simple contract
        const gasPrice = feeData.gasPrice;

        // Calculate estimated cost
        const estimatedCost = BigInt(gasLimit) * gasPrice;
        const estimatedCostInEth = ethers.formatEther(estimatedCost);
        console.log('Estimated deployment cost:', estimatedCostInEth, 'ETH');

        console.log('🔄 Deploying simple test contract...');

        // Deploy the contract
        const tx = await wallet.sendTransaction({
            data: contractBytecode,
            gasLimit: gasLimit,
            gasPrice: gasPrice
        });

        console.log('📤 Transaction hash:', tx.hash);
        console.log('⏳ Waiting for deployment confirmation...');

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log('✅ Contract deployed successfully!');
            console.log('📍 Contract address:', receipt.contractAddress);
            console.log('⛽ Gas used:', receipt.gasUsed.toString());
            console.log('💰 Total cost:', ethers.formatEther(receipt.gasUsed * receipt.gasPrice), 'ETH');
        } else {
            console.log('❌ Deployment failed');
        }

    } catch (error) {
        console.log('❌ Deployment error:', error.message);
    }
}

main().catch(console.error);