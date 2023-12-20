// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNft is ERC721 {
    constructor()
        ERC721("MyToken", "MTK")
    {}

    function safeMint(uint256 amount) public {
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, i);
        }
    }
}