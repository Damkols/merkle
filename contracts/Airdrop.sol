// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleDistributor {
    address public owner;
    IERC20 public token;
    bytes32 public merkleRoot;

    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot) {
        owner = msg.sender;
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function isClaimed(address account) public view returns (bool) {
        return claimed[account];
    }

    function claim(uint256 amount, bytes32[] memory proof) external {
        require(!claimed[msg.sender], "Already claimed");
        require(verifyProof(proof, leafFor(msg.sender)), "Invalid proof");

        claimed[msg.sender] = true;
        token.transfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    function leafFor(address account) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    function verifyProof(bytes32[] memory proof, bytes32 leaf) public view returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == merkleRoot;
    }
}
