// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Counter
 * @dev A simple counter contract that allows increment and decrement operations
 */
contract Counter {
    uint256 public count;
    address public owner;
    
    event CountUpdated(address indexed operator, uint256 newCount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Counter: caller is not the owner");
        _;
    }
    
    /**
     * @dev Increments the counter by 1
     */
    function increment() public {
        count += 1;
        emit CountUpdated(msg.sender, count);
    }
    
    /**
     * @dev Decrements the counter by 1
     * @notice Counter cannot go below zero
     */
    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit CountUpdated(msg.sender, count);
    }
    
    /**
     * @dev Resets the counter to zero
     * @notice Only the owner can reset the counter
     */
    function reset() public onlyOwner {
        count = 0;
        emit CountUpdated(msg.sender, count);
    }
    
    /**
     * @dev Sets the counter to a specific value
     * @param _count The new value to set
     * @notice Only the owner can set the counter
     */
    function setCount(uint256 _count) public onlyOwner {
        count = _count;
        emit CountUpdated(msg.sender, count);
    }
}
