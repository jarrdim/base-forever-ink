// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts/GuestbookOptimized.sol";

/**
 * @title DeployGuestbook
 * @notice Deployment script for Guestbook contract to Base Sepolia
 * @dev Run with: forge script script/DeployGuestbook.s.sol:DeployGuestbook --rpc-url base-sepolia --broadcast --verify
 */
contract DeployGuestbook {
    // Base Sepolia USDC address
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the Guestbook contract
        Guestbook guestbook = new Guestbook(USDC_BASE_SEPOLIA);
        
        console.log("Guestbook deployed to:", address(guestbook));
        console.log("Owner:", guestbook.owner());
        console.log("USDC Token:", guestbook.getUSDCAddress());
        console.log("Signing Fee:", guestbook.getSigningFee());
        
        vm.stopBroadcast();
    }
}
