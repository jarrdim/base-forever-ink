// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title Guestbook
 * @notice A permanent guestbook on Base blockchain with USDC payment requirement
 * @dev Messages are stored permanently and cannot be deleted. Requires 1 USDC payment per message.
 * @custom:gas-optimized Uses uint32 for timestamps, packed structs, and efficient storage patterns
 */
contract Guestbook {
    struct Message {
        address sender;
        string content;
        uint32 timestamp;  // Changed from uint256 to uint32 for gas optimization
        string username;
        string tag;
    }
    
    Message[] public messages;
    address public immutable owner;
    IERC20 public immutable usdcToken;
    
    uint256 public constant SIGNING_FEE = 1e6; // 1 USDC (6 decimals)
    uint256 public totalFeesCollected;
    
    event MessageSigned(
        address indexed sender,
        string content,
        uint256 timestamp,
        string username,
        string tag,
        uint256 feeAmount
    );
    
    event FeeCollected(address indexed payer, uint256 amount);
    
    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Sign the guestbook with a message (requires 1 USDC payment)
     * @param _content The message content
     * @param _username Optional username
     * @param _tag Optional tag for categorization
     */
    function signGuestbook(
        string memory _content,
        string memory _username,
        string memory _tag
    ) external {
        require(bytes(_content).length > 0, "Message cannot be empty");
        require(bytes(_content).length <= 500, "Message too long");
        
        // Check USDC balance and allowance
        require(usdcToken.balanceOf(msg.sender) >= SIGNING_FEE, "Insufficient USDC balance");
        require(usdcToken.allowance(msg.sender, address(this)) >= SIGNING_FEE, "Insufficient USDC allowance");
        
        // Transfer USDC from user to contract
        require(usdcToken.transferFrom(msg.sender, address(this), SIGNING_FEE), "USDC transfer failed");
        
        // Update total fees collected
        totalFeesCollected += SIGNING_FEE;
        
        messages.push(Message({
            sender: msg.sender,
            content: _content,
            timestamp: uint32(block.timestamp),
            username: _username,
            tag: _tag
        }));
        
        emit MessageSigned(msg.sender, _content, block.timestamp, _username, _tag, SIGNING_FEE);
        emit FeeCollected(msg.sender, SIGNING_FEE);
    }
    
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }
    
    function getMessage(uint256 index) external view returns (
        address sender,
        string memory content,
        uint256 timestamp,
        string memory username,
        string memory tag
    ) {
        require(index < messages.length, "Index out of bounds");
        Message memory message = messages[index];
        return (message.sender, message.content, uint256(message.timestamp), message.username, message.tag);
    }
    
    function getAllMessages() external view returns (Message[] memory) {
        return messages;
    }
    
    function getMessagesInRange(uint256 start, uint256 end) external view returns (Message[] memory) {
        require(start < messages.length, "Start index out of bounds");
        require(end <= messages.length, "End index out of bounds");
        require(start < end, "Invalid range");
        
        uint256 length = end - start;
        Message[] memory result = new Message[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = messages[start + i];
        }
        
        return result;
    }
    
    function getSigningFee() external pure returns (uint256) {
        return SIGNING_FEE;
    }
    
    function getUSDCAddress() external view returns (address) {
        return address(usdcToken);
    }
    
    function withdrawFees() external {
        require(msg.sender == owner, "Only owner can withdraw fees");
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(usdcToken.transfer(owner, balance), "Transfer failed");
    }
    
    function emergencyWithdraw(address token, uint256 amount) external {
        require(msg.sender == owner, "Only owner can emergency withdraw");
        IERC20(token).transfer(owner, amount);
    }
}
