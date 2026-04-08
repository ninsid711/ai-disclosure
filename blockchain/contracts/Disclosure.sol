// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Disclosure {
    struct Record {
        string cid;
        bool aiUsed;
        uint256 timestamp;
        address creator;
    }

    // Store all records (history)
    Record[] public records;

    // Map content hash → list of record indices (version history)
    mapping(string => uint256[]) private hashToRecords;

    // Prevent duplicate submissions from same user (optional integrity layer)
    mapping(string => mapping(address => bool)) public hasSubmitted;

    // Event for frontend listening
    event RecordAdded(
        string contentHash,
        bool aiUsed,
        address indexed creator,
        uint256 timestamp
    );

    // 🔹 Add new disclosure
    function addRecord(string memory _hash, bool _aiUsed) public {
        require(bytes(_hash).length > 0, "Empty hash not allowed");

        // Optional: prevent same user from submitting same content again
        require(!hasSubmitted[_hash][msg.sender], "Already submitted");

        Record memory newRecord = Record({
            cid: _hash,
            aiUsed: _aiUsed,
            timestamp: block.timestamp,
            creator: msg.sender
        });

        records.push(newRecord);
        uint256 index = records.length - 1;

        hashToRecords[_hash].push(index);
        hasSubmitted[_hash][msg.sender] = true;

        emit RecordAdded(_hash, _aiUsed, msg.sender, block.timestamp);
    }

    // 🔹 Get latest record for a hash
    function getLatestRecord(
        string memory _hash
    ) public view returns (Record memory) {
        require(hashToRecords[_hash].length > 0, "No record found");

        uint256 latestIndex = hashToRecords[_hash][
            hashToRecords[_hash].length - 1
        ];
        return records[latestIndex];
    }

    // 🔹 Get full history of a content hash
    function getAllRecords(
        string memory _hash
    ) public view returns (Record[] memory) {
        uint256[] memory indices = hashToRecords[_hash];
        require(indices.length > 0, "No records found");

        Record[] memory result = new Record[](indices.length);

        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = records[indices[i]];
        }

        return result;
    }

    // 🔹 Get total records (for analytics/debugging)
    function getTotalRecords() public view returns (uint256) {
        return records.length;
    }
}
