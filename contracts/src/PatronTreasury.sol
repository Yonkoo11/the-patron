// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatronTreasury {
    address public immutable patron;

    struct Grant {
        address recipient;
        uint256 amount;
        bytes32 reasonHash;
        uint256 timestamp;
        uint256 roundId;
    }

    uint256 public grantCount;
    uint256 public currentRound;
    uint256 public totalDisbursed;
    mapping(uint256 => Grant) public grants;
    mapping(address => uint256) public totalGrantedTo;

    event GrantDisbursed(
        uint256 indexed grantId,
        uint256 indexed roundId,
        address indexed recipient,
        uint256 amount,
        bytes32 reasonHash
    );
    event RoundStarted(uint256 indexed roundId, string theme);
    event TreasuryFunded(address indexed funder, uint256 amount);

    modifier onlyPatron() {
        require(msg.sender == patron, "Not the patron");
        _;
    }

    constructor() {
        patron = msg.sender;
    }

    receive() external payable {
        emit TreasuryFunded(msg.sender, msg.value);
    }

    function startRound(string calldata theme) external onlyPatron {
        currentRound++;
        emit RoundStarted(currentRound, theme);
    }

    function disburse(
        address recipient,
        bytes32 reasonHash
    ) external payable onlyPatron {
        require(recipient != address(0), "Zero address");
        require(msg.value > 0, "Zero amount");

        grantCount++;
        grants[grantCount] = Grant({
            recipient: recipient,
            amount: msg.value,
            reasonHash: reasonHash,
            timestamp: block.timestamp,
            roundId: currentRound
        });
        totalGrantedTo[recipient] += msg.value;
        totalDisbursed += msg.value;

        (bool ok, ) = recipient.call{value: msg.value}("");
        require(ok, "Transfer failed");

        emit GrantDisbursed(grantCount, currentRound, recipient, msg.value, reasonHash);
    }

    function getGrant(uint256 id) external view returns (Grant memory) {
        return grants[id];
    }

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
