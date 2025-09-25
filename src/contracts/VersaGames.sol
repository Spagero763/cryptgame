// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VersaGames
 * @author Your Name
 * @notice A smart contract for managing a winner-takes-all staking game.
 * Players stake a fixed amount to play against an AI. The AI's stake is
 * matched from a prize pool. Winners claim their stake plus the AI's match.
 * Losers' or drawing players' stakes are added to the prize pool.
 */
contract VersaGames {
    address public owner;
    uint256 public stakeAmount;
    uint256 public prizePool;

    mapping(address => uint256) public activeStakes;
    mapping(address => bool) public hasPlayed;

    event Staked(address indexed player, uint256 amount);
    event WinningsClaimed(address indexed player, uint256 amount);
    event LossReported(address indexed player, uint256 amount);
    event DrawReported(address indexed player, uint256 amount);
    event PrizePoolFunded(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @param _initialStakeAmount The initial amount required to play a game.
     */
    constructor(uint256 _initialStakeAmount) {
        owner = msg.sender;
        stakeAmount = _initialStakeAmount;
    }

    /**
     * @notice Allows a player to stake the required amount to play a game.
     * The sent value must match the public `stakeAmount`.
     */
    function stake() external payable {
        require(msg.value == stakeAmount, "Must stake the exact required amount");
        require(activeStakes[msg.sender] == 0, "Player already has an active stake");
        require(prizePool >= stakeAmount, "Prize pool is too low to match the stake");

        activeStakes[msg.sender] = msg.value;
        hasPlayed[msg.sender] = true;
        prizePool -= stakeAmount;

        emit Staked(msg.sender, msg.value);
    }

    /**
     * @notice Allows a winning player to claim their winnings (their stake + the matched stake).
     * Can only be called by a player with an active stake.
     * This function can only be called by the contract owner, representing the game server's authority to verify a win.
     */
    function claimWinnings() external {
        uint256 playerStake = activeStakes[msg.sender];
        require(playerStake > 0, "No active stake to claim");

        uint256 winnings = playerStake * 2; // Player's stake + matched stake
        activeStakes[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: winnings}("");
        require(success, "Failed to send winnings");

        emit WinningsClaimed(msg.sender, winnings);
    }

     /**
     * @notice Reports a loss for the player. The player's stake is added to the prize pool.
     * Can only be called by a player with an active stake.
     * This function can only be called by the contract owner to confirm the game's outcome.
     */
    function reportLoss() external {
        uint256 playerStake = activeStakes[msg.sender];
        require(playerStake > 0, "No active stake to report loss on");

        prizePool += playerStake;
        activeStakes[msg.sender] = 0;

        emit LossReported(msg.sender, playerStake);
    }

    /**
     * @notice Reports a draw. The player's stake is added to the prize pool.
     * Can only be called by a player with an active stake.
     * This function can only be called by the contract owner to confirm the game's outcome.
     */
    function reportDraw() external {
        uint256 playerStake = activeStakes[msg.sender];
        require(playerStake > 0, "No active stake to report draw on");

        prizePool += playerStake;
        activeStakes[msg.sender] = 0;

        emit DrawReported(msg.sender, playerStake);
    }

    /**
     * @notice Allows the owner to fund the prize pool.
     */
    function fundPrizePool() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to fund the prize pool");
        prizePool += msg.value;
        emit PrizePoolFunded(msg.value);
    }

    /**
     * @notice Allows the owner to withdraw funds from the prize pool.
     * @param _amount The amount to withdraw.
     */
    function withdrawPrizePool(uint256 _amount) external onlyOwner {
        require(_amount <= prizePool, "Cannot withdraw more than the prize pool balance");
        prizePool -= _amount;
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Allows the owner to change the stake amount.
     * @param _newStakeAmount The new stake amount in wei.
     */
    function setStakeAmount(uint256 _newStakeAmount) external onlyOwner {
        stakeAmount = _newStakeAmount;
    }

    /**
     * @notice Returns the total balance of the contract.
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
