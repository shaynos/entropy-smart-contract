// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.19;

import "@pythnetwork/entropy-sdk-solidity/EntropyStructs.sol";
import "@pythnetwork/entropy-sdk-solidity/EntropyErrors.sol";
import "@pythnetwork/entropy-sdk-solidity/EntropyEvents.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

contract EntropyMock is IEntropy {
    // Mock state variables
    mapping(address => EntropyStructs.ProviderInfo) private _providers;
    mapping(uint64 => EntropyStructs.Request) private _requests;
    uint64 private _currentSequenceNumber;

    // Event for mock purposes
    event RandomNumberGenerated(uint64 sequenceNumber, bytes32 randomNumber);

    // Initialize mock contract
    constructor() {
        _currentSequenceNumber = 1; // Starting sequence number
    }

    // Mock function to simulate randomness request
    function requestRandomness() public returns (uint64) {
        uint64 sequenceNumber = _currentSequenceNumber++;
        bytes32 randomNumber = keccak256(
            abi.encodePacked(block.timestamp, sequenceNumber)
        );

        // Store the request
        _requests[sequenceNumber] = EntropyStructs.Request({
            provider: address(this),
            requester: msg.sender,
            sequenceNumber: sequenceNumber,
            commitment: randomNumber,
            blockNumber: uint64(block.number),
            useBlockhash: false,
            numHashes: 0
        });

        emit RandomNumberGenerated(sequenceNumber, randomNumber);
        return sequenceNumber;
    }

    // Mock function to get the random number associated with a sequence number
    function getRandomNumber(
        uint64 sequenceNumber
    ) public view returns (bytes32) {
        require(
            _requests[sequenceNumber].requester == msg.sender,
            "Not authorized or invalid request"
        );
        return _requests[sequenceNumber].commitment;
    }

    // Other required functions from IEntropy interface (with minimal implementation for mock)
    function register(
        uint128,
        bytes32,
        bytes calldata,
        uint64,
        bytes calldata
    ) public override {}

    function withdraw(uint128) public override {}

    function request(
        address,
        bytes32,
        bool
    ) public payable override returns (uint64) {
        return 1;
    }

    function reveal(
        address,
        uint64,
        bytes32,
        bytes32
    ) public override returns (bytes32) {
        return bytes32(0);
    }

    function getProviderInfo(
        address
    ) public view override returns (EntropyStructs.ProviderInfo memory) {
        return
            EntropyStructs.ProviderInfo({
                feeInWei: 0,
                sequenceNumber: 0,
                endSequenceNumber: 0,
                originalCommitment: bytes32(0),
                currentCommitment: bytes32(0),
                originalCommitmentSequenceNumber: 0,
                currentCommitmentSequenceNumber: 0,
                commitmentMetadata: "",
                uri: "",
                accruedFeesInWei: 0
            });
    }

    function getDefaultProvider() public view override returns (address) {
        return address(this);
    }

    function getRequest(
        address,
        uint64
    ) public view override returns (EntropyStructs.Request memory) {
        return
            EntropyStructs.Request({
                provider: address(this),
                requester: address(0),
                sequenceNumber: 1,
                commitment: bytes32(0),
                blockNumber: 0,
                useBlockhash: false,
                numHashes: 0
            });
    }

    function getFee(address) public view override returns (uint128) {
        return 0.01 ether;
    }

    function getPythFee() public view returns (uint128) {
        return 0;
    }

    function getAccruedPythFees() public view override returns (uint128) {
        return 0;
    }

    function constructUserCommitment(
        bytes32
    ) public pure override returns (bytes32) {
        return bytes32(0);
    }

    function combineRandomValues(
        bytes32,
        bytes32,
        bytes32
    ) public pure override returns (bytes32) {
        return bytes32(0);
    }

    function isActive(
        EntropyStructs.Request storage
    ) internal view returns (bool) {
        return true;
    }
}
