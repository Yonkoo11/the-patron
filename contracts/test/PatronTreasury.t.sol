// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {PatronTreasury} from "../src/PatronTreasury.sol";

contract PatronTreasuryTest is Test {
    PatronTreasury public treasury;
    address patron = address(this);
    address builder1 = makeAddr("builder1");
    address builder2 = makeAddr("builder2");
    address builder3 = makeAddr("builder3");
    address rando = makeAddr("rando");

    function setUp() public {
        treasury = new PatronTreasury();
        // Fund the test contract so it can send ETH with disburse
        vm.deal(patron, 10 ether);
    }

    function test_patron_is_deployer() public view {
        assertEq(treasury.patron(), patron);
    }

    function test_initial_state() public view {
        assertEq(treasury.grantCount(), 0);
        assertEq(treasury.currentRound(), 0);
        assertEq(treasury.totalDisbursed(), 0);
        assertEq(treasury.treasuryBalance(), 0);
    }

    function test_receive_ether() public {
        (bool ok, ) = address(treasury).call{value: 1 ether}("");
        assertTrue(ok);
        assertEq(treasury.treasuryBalance(), 1 ether);
    }

    function test_start_round() public {
        treasury.startRound("DeFi Innovation");
        assertEq(treasury.currentRound(), 1);

        treasury.startRound("NFT Builders");
        assertEq(treasury.currentRound(), 2);
    }

    function test_start_round_emits_event() public {
        vm.expectEmit(true, false, false, true);
        emit PatronTreasury.RoundStarted(1, "DeFi Innovation");
        treasury.startRound("DeFi Innovation");
    }

    function test_start_round_only_patron() public {
        vm.prank(rando);
        vm.expectRevert("Not the patron");
        treasury.startRound("Unauthorized");
    }

    function test_disburse() public {
        treasury.startRound("Test Round");

        bytes32 reason = keccak256("Great builder, deployed novel AMM");
        treasury.disburse{value: 0.003 ether}(builder1, reason);

        assertEq(treasury.grantCount(), 1);
        assertEq(treasury.totalDisbursed(), 0.003 ether);
        assertEq(treasury.totalGrantedTo(builder1), 0.003 ether);
        assertEq(builder1.balance, 0.003 ether);

        PatronTreasury.Grant memory g = treasury.getGrant(1);
        assertEq(g.recipient, builder1);
        assertEq(g.amount, 0.003 ether);
        assertEq(g.reasonHash, reason);
        assertEq(g.roundId, 1);
    }

    function test_disburse_emits_event() public {
        treasury.startRound("Test Round");
        bytes32 reason = keccak256("Good work");

        vm.expectEmit(true, true, true, true);
        emit PatronTreasury.GrantDisbursed(1, 1, builder1, 0.001 ether, reason);
        treasury.disburse{value: 0.001 ether}(builder1, reason);
    }

    function test_disburse_multiple_grants() public {
        treasury.startRound("Round 1");

        treasury.disburse{value: 0.001 ether}(builder1, keccak256("reason1"));
        treasury.disburse{value: 0.002 ether}(builder2, keccak256("reason2"));
        treasury.disburse{value: 0.005 ether}(builder3, keccak256("reason3"));

        assertEq(treasury.grantCount(), 3);
        assertEq(treasury.totalDisbursed(), 0.008 ether);
        assertEq(builder1.balance, 0.001 ether);
        assertEq(builder2.balance, 0.002 ether);
        assertEq(builder3.balance, 0.005 ether);
    }

    function test_disburse_across_rounds() public {
        treasury.startRound("Round 1");
        treasury.disburse{value: 0.001 ether}(builder1, keccak256("r1"));

        treasury.startRound("Round 2");
        treasury.disburse{value: 0.002 ether}(builder2, keccak256("r2"));

        PatronTreasury.Grant memory g1 = treasury.getGrant(1);
        PatronTreasury.Grant memory g2 = treasury.getGrant(2);
        assertEq(g1.roundId, 1);
        assertEq(g2.roundId, 2);
    }

    function test_disburse_accumulates_per_recipient() public {
        treasury.startRound("Round 1");
        treasury.disburse{value: 0.001 ether}(builder1, keccak256("first"));
        treasury.disburse{value: 0.002 ether}(builder1, keccak256("second"));

        assertEq(treasury.totalGrantedTo(builder1), 0.003 ether);
    }

    function test_disburse_zero_address_reverts() public {
        vm.expectRevert("Zero address");
        treasury.disburse{value: 0.001 ether}(address(0), keccak256("bad"));
    }

    function test_disburse_zero_amount_reverts() public {
        vm.expectRevert("Zero amount");
        treasury.disburse{value: 0}(builder1, keccak256("bad"));
    }

    function test_disburse_only_patron() public {
        vm.deal(rando, 1 ether);
        vm.prank(rando);
        vm.expectRevert("Not the patron");
        treasury.disburse{value: 0.001 ether}(builder1, keccak256("bad"));
    }

    function test_treasury_balance_reflects_deposits() public {
        (bool ok, ) = address(treasury).call{value: 0.5 ether}("");
        assertTrue(ok);
        assertEq(treasury.treasuryBalance(), 0.5 ether);

        (ok, ) = address(treasury).call{value: 0.3 ether}("");
        assertTrue(ok);
        assertEq(treasury.treasuryBalance(), 0.8 ether);
    }

    function test_funded_event_on_receive() public {
        vm.expectEmit(true, false, false, true);
        emit PatronTreasury.TreasuryFunded(patron, 1 ether);
        (bool ok, ) = address(treasury).call{value: 1 ether}("");
        assertTrue(ok);
    }

    function test_get_nonexistent_grant() public view {
        PatronTreasury.Grant memory g = treasury.getGrant(999);
        assertEq(g.recipient, address(0));
        assertEq(g.amount, 0);
    }
}
