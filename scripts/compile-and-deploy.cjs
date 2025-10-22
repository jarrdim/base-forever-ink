const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
require('dotenv').config();

// Base Sepolia RPC URL
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// USDC address on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

async function compileContract() {
    console.log('📝 Compiling GuestbookOptimized.sol...\n');

    // Read the contract
    const contractPath = path.join(__dirname, '../contracts/GuestbookOptimized.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Prepare input for solc
    const input = {
        language: 'Solidity',
        sources: {
            'GuestbookOptimized.sol': {
                content: source
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    // Compile
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for errors
    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:');
            errors.forEach(err => console.error(err.formattedMessage));
            throw new Error('Contract compilation failed');
        }
    }

    const contract = output.contracts['GuestbookOptimized.sol']['Guestbook'];

    console.log('✅ Contract compiled successfully!');
    console.log('📦 Bytecode size:', contract.evm.bytecode.object.length / 2, 'bytes\n');

    return {
        abi: contract.abi,
        bytecode: '0x' + contract.evm.bytecode.object
    };
}

async function estimateDeploymentCost(provider) {
    console.log('💰 Estimating deployment cost on Base Sepolia...\n');

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Base Sepolia optimized gas: actual deployment typically uses 1,500,000 - 1,800,000 gas
    const estimatedGas = 1800000n;
    const deploymentCost = gasPrice * estimatedGas;

    console.log('Gas Price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
    console.log('Estimated Gas:', estimatedGas.toString());
    console.log('Total Cost:', ethers.formatEther(deploymentCost), 'ETH');

    // Base Sepolia gas is extremely cheap - typically costs < $0.01
    const ethPriceUSD = 2500;
    const costUSD = parseFloat(ethers.formatEther(deploymentCost)) * ethPriceUSD;
    console.log('Estimated Cost in USD: $' + costUSD.toFixed(6));

    if (costUSD > 0.20) {
        console.log('\n⚠️  WARNING: Cost may exceed $0.20 target');
    } else {
        console.log('✅ Cost is WELL within $0.20 budget! (Base Sepolia is very cheap)\n');
    }

    return deploymentCost;
}

async function deployContract() {
    try {
        console.log('🚀 Starting Guestbook Deployment to Base Sepolia\n');
        console.log('='.repeat(50) + '\n');

        // Compile contract
        const { abi, bytecode } = await compileContract();

        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log('📋 Deployment Details:');
        console.log('Deployer Address:', wallet.address);
        console.log('Network: Base Sepolia');
        console.log('USDC Token Address:', USDC_ADDRESS);
        console.log('');

        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log('💳 Deployer Balance:', ethers.formatEther(balance), 'ETH');

        // Base Sepolia is very cheap! Only need ~0.0002 ETH for deployment
        if (balance < ethers.parseEther('0.0002')) {
            throw new Error('\n❌ Insufficient ETH balance. Need at least 0.0002 ETH for deployment on Base Sepolia.');
        }
        console.log('✅ Sufficient balance for Base Sepolia deployment!\n');

        // Estimate cost
        await estimateDeploymentCost(provider);

        // Create contract factory
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);

        console.log('🔨 Deploying contract with optimized gas for Base Sepolia...');
        console.log('(This may take 10-30 seconds)\n');

        // Get current gas price for optimization
        const feeData = await provider.getFeeData();

        // Deploy with constructor parameter (USDC address)
        // Base Sepolia optimized: lower gas limit since gas is cheap
        const contract = await factory.deploy(USDC_ADDRESS, {
            gasLimit: 2000000, // Optimized for Base Sepolia
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });

        console.log('⏳ Transaction submitted!');
        console.log('Transaction Hash:', contract.deploymentTransaction().hash);
        console.log('Waiting for confirmation...\n');

        // Wait for deployment
        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();

        console.log('='.repeat(50));
        console.log('✅ CONTRACT DEPLOYED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\n📍 Contract Address:', contractAddress);
        console.log('🔍 View on BaseScan: https://sepolia.basescan.org/address/' + contractAddress);
        console.log('');

        // Get actual gas used
        const receipt = await contract.deploymentTransaction().wait();
        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.gasPrice;
        const actualCost = gasUsed * gasPrice;
        const ethPriceUSD = 2500; // Update with current price
        const costUSD = parseFloat(ethers.formatEther(actualCost)) * ethPriceUSD;

        console.log('⛽ Deployment Stats:');
        console.log('Gas Used:', gasUsed.toString());
        console.log('Gas Price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
        console.log('Actual Cost:', ethers.formatEther(actualCost), 'ETH');
        console.log('Actual Cost USD: $' + costUSD.toFixed(4));
        console.log('');

        // Save contract address and ABI
        const outputDir = path.join(__dirname, '../deployed-contracts');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const deploymentInfo = {
            contractAddress,
            network: 'base-sepolia',
            usdcAddress: USDC_ADDRESS,
            deployedAt: new Date().toISOString(),
            deployer: wallet.address,
            transactionHash: contract.deploymentTransaction().hash,
            gasUsed: gasUsed.toString(),
            deploymentCost: ethers.formatEther(actualCost) + ' ETH',
            abi: abi
        };

        fs.writeFileSync(
            path.join(outputDir, 'deployment-info.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('💾 Deployment info saved to: deployed-contracts/deployment-info.json\n');

        // Instructions
        console.log('='.repeat(50));
        console.log('📝 NEXT STEPS:');
        console.log('='.repeat(50));
        console.log('\n1. Update Frontend Configuration:');
        console.log('   File: src/lib/paid-guestbook-contract.ts');
        console.log('   Replace the contract address with:');
        console.log('   ' + contractAddress);
        console.log('');
        console.log('2. Verify Contract on BaseScan (Optional but recommended):');
        console.log('   - Go to: https://sepolia.basescan.org/address/' + contractAddress);
        console.log('   - Click "Contract" → "Verify and Publish"');
        console.log('   - Compiler: v0.8.20+commit.a1b79de6');
        console.log('   - Optimization: Yes, 200 runs');
        console.log('   - Constructor args: ' + USDC_ADDRESS);
        console.log('');
        console.log('3. Restart Development Server:');
        console.log('   npm run dev');
        console.log('');
        console.log('4. Test the Application:');
        console.log('   - Connect your wallet');
        console.log('   - Approve USDC spending');
        console.log('   - Sign the guestbook (costs 1 USDC + gas)');
        console.log('');
        console.log('✨ Deployment Complete! Your app is ready to use!\n');

        return contractAddress;

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);

        if (error.message.includes('insufficient funds')) {
            console.log('\n💡 TIP: Get Base Sepolia ETH from:');
            console.log('   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
        }

        throw error;
    }
}

// Run deployment
deployContract()
    .then((address) => {
        console.log('🎉 All done! Contract address:', address);
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
