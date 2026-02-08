// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PatronTreasury} from "../src/PatronTreasury.sol";

contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();
        PatronTreasury treasury = new PatronTreasury();
        console.log("PatronTreasury deployed at:", address(treasury));
        console.log("Patron (owner):", treasury.patron());
        vm.stopBroadcast();
    }
}
