// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleGuestbook {
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

    function signGuestbook(
        string memory _content,
        string memory _username,
        string memory _tag
    ) public {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 500, "Content too long");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 50, "Username too long");
        require(bytes(_tag).length <= 20, "Tag too long");

        Message memory newMessage = Message({
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            username: _username,
            tag: _tag
        });

        messages.push(newMessage);

        emit MessageSigned(msg.sender, _content, block.timestamp, _username, _tag);
    }

    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }

    function getMessage(uint256 _index) public view returns (
        address sender,
        string memory content,
        uint256 timestamp,
        string memory username,
        string memory tag
    ) {
        require(_index < messages.length, "Message not found");
        Message memory message = messages[_index];
        return (message.sender, message.content, message.timestamp, message.username, message.tag);
    }
}