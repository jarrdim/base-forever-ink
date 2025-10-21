// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Guestbook
 * @notice A permanent guestbook on Base blockchain with gasless signatures
 * @dev Messages are stored permanently and cannot be deleted
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
    
    event MessageSigned(
        address indexed sender,
        string content,
        uint256 timestamp,
        string username,
        string tag
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Sign the guestbook with a message
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
        
        messages.push(Message({
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            username: _username,
            tag: _tag
        }));
        
        emit MessageSigned(msg.sender, _content, block.timestamp, _username, _tag);
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
}
