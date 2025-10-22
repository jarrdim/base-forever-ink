const { ethers } = require('ethers');
require('dotenv').config();

// Contract details
const CONTRACT_ADDRESS = '0xD7F15F1378b9D5431edA613F9AD101528efBcf32';
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Simple ABI for view functions
const ABI = [
    {
        "inputs": [],
        "name": "getMessageCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSigningFee",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUSDCAddress",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFeesCollected",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

async function testContract() {
    console.log('🧪 Testing Deployed Contract\n');
    console.log('='.repeat(50));

    try {
        // Connect to Base Sepolia
        const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        console.log('\n📋 Contract Information:');
        console.log('Address:', CONTRACT_ADDRESS);
        console.log('Network: Base Sepolia');
        console.log('Explorer: https://sepolia.basescan.org/address/' + CONTRACT_ADDRESS);

        // Test contract functions
        console.log('\n🔍 Reading Contract State...\n');

        // Get owner
        const owner = await contract.owner();
        console.log('✅ Owner:', owner);

        // Get USDC address
        const usdcAddress = await contract.getUSDCAddress();
        console.log('✅ USDC Token:', usdcAddress);

        // Get signing fee
        const signingFee = await contract.getSigningFee();
        console.log('✅ Signing Fee:', ethers.formatUnits(signingFee, 6), 'USDC');

        // Get message count
        const messageCount = await contract.getMessageCount();
        console.log('✅ Total Signatures:', messageCount.toString());

        // Get total fees collected
        const feesCollected = await contract.totalFeesCollected();
        console.log('✅ Fees Collected:', ethers.formatUnits(feesCollected, 6), 'USDC');

        console.log('\n' + '='.repeat(50));
        console.log('✅ CONTRACT IS LIVE AND WORKING!');
        console.log('='.repeat(50));

        console.log('\n📝 Next Steps:');
        console.log('1. Open http://localhost:8082/ in your browser');
        console.log('2. Connect your wallet (MetaMask/Coinbase)');
        console.log('3. Switch to Base Sepolia network');
        console.log('4. Get test USDC from faucets');
        console.log('5. Approve USDC and sign the guestbook!');
        console.log('\n🎉 Your app is ready to test!\n');

    } catch (error) {
        console.error('\n❌ Error testing contract:', error.message);

        if (error.message.includes('could not detect network')) {
            console.log('\n💡 TIP: Check your internet connection and RPC endpoint');
        } else if (error.message.includes('invalid address')) {
            console.log('\n💡 TIP: Verify the contract address is correct');
        }
    }
}

testContract();
