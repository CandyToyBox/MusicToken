// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";

/**
 * @title SoundToken
 * @dev Non-tradeable ERC20 token that tracks plays on-chain
 */
contract SoundToken is ERC20Base, Ownable {
    string public songTitle;
    string public songArtist;
    uint256 public songId;
    uint256 public totalPlays;
    
    // Mapping of user address to play count
    mapping(address => uint256) public userPlays;
    
    // Play event emitted when a play is recorded
    event PlayRecorded(address indexed user, uint256 songId, uint256 timestamp);
    
    /**
     * @dev Constructor for SoundToken
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _songTitle Title of the song
     * @param _songArtist Artist name
     * @param _songId Unique ID of the song in our database
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _songTitle,
        string memory _songArtist,
        uint256 _songId,
        address _initialOwner
    ) ERC20Base(_name, _symbol, _initialOwner) {
        songTitle = _songTitle;
        songArtist = _songArtist;
        songId = _songId;
        
        // Mint all tokens to the owner
        // These tokens cannot be transferred - they are just for tracking
        _mint(_initialOwner, 1000000 * 10**18);
    }
    
    /**
     * @dev Override transfer function to make tokens non-transferable
     */
    function transfer(address, uint256) public pure override returns (bool) {
        revert("SoundToken: tokens are non-transferable");
    }
    
    /**
     * @dev Override transferFrom function to make tokens non-transferable
     */
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("SoundToken: tokens are non-transferable");
    }
    
    /**
     * @dev Record a play for a user
     * @param user Address of the user who played the song
     */
    function recordPlay(address user) external returns (bool) {
        require(user != address(0), "SoundToken: invalid user address");
        
        // Increment user play count
        userPlays[user] += 1;
        
        // Increment total plays
        totalPlays += 1;
        
        // Emit play event
        emit PlayRecorded(user, songId, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Get play count for a specific user
     * @param user Address of the user
     * @return Number of plays by this user
     */
    function getPlayCountForUser(address user) external view returns (uint256) {
        return userPlays[user];
    }
    
    /**
     * @dev Get total play count
     * @return Total number of plays
     */
    function getTotalPlayCount() external view returns (uint256) {
        return totalPlays;
    }
}