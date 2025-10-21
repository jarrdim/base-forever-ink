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
 */
contract Guestbook {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        string username;
        string tag;
    }
    
    Message[] public messages;
    address public immutable owner;
    
    // USDC contract address on Base mainnet
    IERC20 public immutable usdcToken;
    uint256 public constant SIGNING_FEE = 1e6; // 1 USDC (6 decimals)
    
    // Track total fees collected
    uint256 public totalFeesCollected;
    
    event MessageSigned(
        address indexed sender,
        string content,
        uint256 timestamp,
        string username,
        string tag,
        uint256 feeAmount
    );
    
    event FeeCollected(
        address indexed payer,
        uint256 amount
    );
    
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
            timestamp: block.timestamp,
            username: _username,
            tag: _tag
        }));
        
        emit MessageSigned(msg.sender, _content, block.timestamp, _username, _tag, SIGNING_FEE);
        emit FeeCollected(msg.sender, SIGNING_FEE);
    }
    
    /**
     * @notice Get total number of messages
     */
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }
    
    /**
     * @notice Get a specific message by index
     */
    function getMessage(uint256 index) external view returns (
        address sender,
        string memory content,
        uint256 timestamp,
        string memory username,
        string memory tag
    ) {
        require(index < messages.length, "Index out of bounds");
        Message memory message = messages[index];
        return (
            message.sender,
            message.content,
            message.timestamp,
            message.username,
            message.tag
        );
    }
    
    /**
     * @notice Get all messages (use with caution for large datasets)
     */
    function getAllMessages() external view returns (Message[] memory) {
        return messages;
    }
    
    /**
     * @notice Get messages in a range (for pagination)
     */
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
    
    /**
     * @notice Get the current signing fee amount
     */
    function getSigningFee() external pure returns (uint256) {
        return SIGNING_FEE;
    }
    
    /**
     * @notice Get USDC token contract address
     */
    function getUSDCAddress() external view returns (address) {
        return address(usdcToken);
    }
    
    /**
     * @notice Withdraw collected USDC fees (owner only)
     */
    function withdrawFees() external {
        require(msg.sender == owner, "Only owner can withdraw fees");
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(usdcToken.transfer(owner, balance), "Transfer failed");
    }
    
    /**
     * @notice Emergency withdraw function (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external {
        require(msg.sender == owner, "Only owner can emergency withdraw");
        IERC20(token).transfer(owner, amount);
    }
}
