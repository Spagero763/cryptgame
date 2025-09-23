// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VersaGames is Ownable, ReentrancyGuard {
    uint256 public gameFee = 0.000001 ether;
    uint256 public stakeAmount = 0.001 ether;
    address payable public aiWallet;

    struct Game {
        address player;
        address ai;
        uint256 stake;
        bool isStaked;
        bool isActive;
    }

    mapping(uint256 => Game) public games;
    uint256 public nextGameId;

    mapping(address => bool) public hasPaidToPlay;

    event GameCreated(uint256 indexed gameId, address indexed player, bool isStaked);
    event StakeReceived(uint256 indexed gameId, address indexed from, uint256 amount);
    event WinnerPaid(uint256 indexed gameId, address indexed winner, uint256 amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor(address payable _initialAiWallet) Ownable(msg.sender) {
        aiWallet = _initialAiWallet;
    }

    function setGameFee(uint256 _newFee) public onlyOwner {
        gameFee = _newFee;
    }

    function setStakeAmount(uint256 _newAmount) public onlyOwner {
        stakeAmount = _newAmount;
    }

    function setAiWallet(address payable _newWallet) public onlyOwner {
        aiWallet = _newWallet;
    }

    function playGame(string memory _gameType) public payable {
        require(msg.value == gameFee, "Incorrect fee paid");
        hasPaidToPlay[msg.sender] = true;
    }

    function createStakedGame() public payable returns (uint256) {
        require(hasPaidToPlay[msg.sender], "Player must pay the game fee first");
        require(msg.value == stakeAmount, "Incorrect stake amount");
        require(address(this).balance >= stakeAmount, "Contract does not have enough funds for AI stake");

        uint256 gameId = nextGameId++;
        games[gameId] = Game({
            player: msg.sender,
            ai: aiWallet,
            stake: stakeAmount * 2,
            isStaked: true,
            isActive: true
        });

        emit GameCreated(gameId, msg.sender, true);
        emit StakeReceived(gameId, msg.sender, msg.value);
        emit StakeReceived(gameId, aiWallet, stakeAmount);

        return gameId;
    }

    function reportWinner(uint256 _gameId, address payable _winner) public onlyOwner nonReentrant {
        Game storage game = games[_gameId];
        require(game.isActive, "Game is not active");
        require(_winner == game.player || _winner == game.ai, "Winner must be the player or the AI");

        game.isActive = false;
        uint256 amountToPay = game.stake;
        game.stake = 0;

        (bool success, ) = _winner.call{value: amountToPay}("");
        require(success, "Failed to send funds to winner");

        emit WinnerPaid(_gameId, _winner, amountToPay);
    }
    
    function withdrawFees() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;

        // Calculate total staked amount that should remain in contract
        uint256 totalStaked = 0;
        for (uint i = 0; i < nextGameId; i++) {
            if (games[i].isActive) {
                totalStaked += games[i].stake;
            }
        }
        
        uint256 withdrawable = balance - totalStaked;
        require(withdrawable > 0, "No fees to withdraw");

        (bool success, ) = owner().call{value: withdrawable}("");
        require(success, "Withdrawal failed");
        emit FeesWithdrawn(owner(), withdrawable);
    }

    receive() external payable {}
    fallback() external payable {}
}
