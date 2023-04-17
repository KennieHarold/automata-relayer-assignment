// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token3 is ERC20 {
    constructor() ERC20("Token3", "T3") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }
}
