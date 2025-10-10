// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title EncryptedCounter
 * @notice A simple encrypted counter contract for demonstrating FHEVM functionality
 * @dev Uses euint32 for encrypted counter state
 */
contract EncryptedCounter is GatewayCaller {
    /// @notice The encrypted counter value
    euint32 private counter;

    /// @notice Emitted when the counter is incremented
    event CounterIncremented(address indexed user);

    /// @notice Emitted when the counter is decremented
    event CounterDecremented(address indexed user);

    constructor() {
        // Initialize counter to 0
        counter = TFHE.asEuint32(0);
        TFHE.allow(counter, address(this));
    }

    /**
     * @notice Increment the counter by an encrypted value
     * @param encryptedValue The encrypted value to add (euint32)
     */
    function increment(einput encryptedValue, bytes calldata inputProof) public {
        euint32 value = TFHE.asEuint32(encryptedValue, inputProof);
        counter = TFHE.add(counter, value);
        TFHE.allow(counter, address(this));

        emit CounterIncremented(msg.sender);
    }

    /**
     * @notice Decrement the counter by an encrypted value
     * @param encryptedValue The encrypted value to subtract (euint32)
     */
    function decrement(einput encryptedValue, bytes calldata inputProof) public {
        euint32 value = TFHE.asEuint32(encryptedValue, inputProof);
        counter = TFHE.sub(counter, value);
        TFHE.allow(counter, address(this));

        emit CounterDecremented(msg.sender);
    }

    /**
     * @notice Get the encrypted counter value
     * @dev Returns the encrypted handle that can be decrypted client-side
     * @return The encrypted counter (euint32)
     */
    function getCounter() public view returns (euint32) {
        return counter;
    }

    /**
     * @notice Get the encrypted counter value with permission for a specific address
     * @param user The address to grant permission to
     * @return The encrypted counter (euint32)
     */
    function getCounterForUser(address user) public view returns (euint32) {
        TFHE.allow(counter, user);
        return counter;
    }
}
