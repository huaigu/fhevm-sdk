// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract with on-chain decryption
/// @author fhevm-hardhat-template
/// @notice A basic example contract showing encrypted data operations and asynchronous on-chain decryption using FHEVM.
/// @dev Demonstrates both client-side decryption (via FHE.allow) and on-chain decryption (via FHE.requestDecryption)
contract FHECounter is SepoliaConfig {
    euint32 private _count;

    /// @notice Mapping from decryption requestId to the decrypted count value
    mapping(uint256 => uint32) private _decryptedCounts;

    /// @notice Mapping from decryption requestId to the requester address
    mapping(uint256 => address) private _decryptionRequesters;

    /// @notice Flag to prevent multiple simultaneous decryption requests
    bool private isDecryptionPending;

    /// @notice The latest decryption request ID
    uint256 private latestRequestId;

    /// @notice Event emitted when on-chain decryption is requested
    /// @param requestId The unique identifier for this decryption request
    /// @param requester The address that requested the decryption
    event DecryptionRequested(uint256 indexed requestId, address indexed requester);

    /// @notice Event emitted when on-chain decryption is completed
    /// @param requestId The unique identifier for this decryption request
    /// @param decryptedValue The decrypted count value
    event DecryptionCompleted(uint256 indexed requestId, uint32 decryptedValue);

    /// @notice Returns the current count
    /// @return The current encrypted count
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.add(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.sub(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Requests on-chain decryption of the current count
    /// @return requestId The unique identifier for this decryption request
    /// @dev This initiates an asynchronous decryption request. The result will be delivered
    /// via the callbackDecryptCount function once the decryption oracle processes the request.
    function requestDecryptCount() external returns (uint256 requestId) {
        require(!isDecryptionPending, "Decryption is in progress");

        // Prepare the ciphertext handles array for decryption request
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(_count);

        // Request decryption from the DecryptionOracle
        // This will trigger a callback to callbackDecryptCount when ready
        latestRequestId = FHE.requestDecryption(
            cts,
            this.callbackDecryptCount.selector
        );

        // Prevent multiple simultaneous requests
        isDecryptionPending = true;

        // Store the requester for later verification
        _decryptionRequesters[latestRequestId] = msg.sender;

        emit DecryptionRequested(latestRequestId, msg.sender);

        return latestRequestId;
    }

    /// @notice Callback function called by the decryption oracle with the decrypted count
    /// @param requestId The unique identifier for this decryption request
    /// @param cleartexts The decrypted cleartext values
    /// @param decryptionProof The proof of decryption for verification
    /// @dev This function is called by the FHEVM decryption oracle after processing the request
    /// WARNING: In production, add access control to ensure only the oracle can call this
    function callbackDecryptCount(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) public returns (bool) {
        // Verify this is the expected request
        require(requestId == latestRequestId, "Invalid requestId");

        // Verify the decryption proof
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode the decrypted value
        (uint32 decryptedCount) = abi.decode(cleartexts, (uint32));

        // Store the decrypted value
        _decryptedCounts[requestId] = decryptedCount;

        // Allow new decryption requests
        isDecryptionPending = false;

        emit DecryptionCompleted(requestId, decryptedCount);

        return true;
    }

    /// @notice Retrieves the decrypted count for a specific request
    /// @param requestId The unique identifier for the decryption request
    /// @return The decrypted count value, or 0 if not yet decrypted
    /// @dev Returns 0 if the decryption hasn't completed yet
    function getDecryptedCount(uint256 requestId) external view returns (uint32) {
        return _decryptedCounts[requestId];
    }

    /// @notice Checks if a decryption request has been completed
    /// @param requestId The unique identifier for the decryption request
    /// @return True if the decryption has completed, false otherwise
    function isDecryptionCompleted(uint256 requestId) external view returns (bool) {
        return _decryptedCounts[requestId] != 0 || _decryptionRequesters[requestId] != address(0);
    }

    /// @notice Gets the address that requested a specific decryption
    /// @param requestId The unique identifier for the decryption request
    /// @return The address that initiated the decryption request
    function getDecryptionRequester(uint256 requestId) external view returns (address) {
        return _decryptionRequesters[requestId];
    }
}
