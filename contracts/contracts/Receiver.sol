// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Receiver is EIP712 {
    using ECDSA for bytes32;

    struct MetaTx {
        address from;
        address to;
        address token;
        uint256 amount;
        uint256 nonce;
    }

    struct MetaTxWithSig {
        MetaTx metaTx;
        bytes signature;
    }

    bytes32 private constant _TYPEHASH =
        keccak256("MetaTx(address from,address to,address token,uint256 amount,uint256 nonce)");

    mapping(address => uint256) private nonces;
    mapping(address => bool) allowedTokens;

    /**
     * @dev Main constructor.
     * @param _allowedTokens array of allowed ERC20 token addresses
     */
    constructor(address[] memory _allowedTokens) EIP712("AutomataRelayerDapp", "1") {
        uint256 allowedTokensLength = _allowedTokens.length;

        for (uint256 i = 0; i < allowedTokensLength; ++i) {
            allowedTokens[_allowedTokens[i]] = true;
        }
    }

    /// @dev Get nonce of the requester
    function getNonce(address from) public view returns (uint256) {
        return nonces[from];
    }

    /**
     * @dev Verifies signature based on EIP712.
     * See https://eips.ethereum.org/EIPS/eip-712
     */
    function verify(MetaTx calldata _tx, bytes calldata _signature) internal view returns (bool) {
        address signer = _hashTypedDataV4(
            keccak256(abi.encode(_TYPEHASH, _tx.from, _tx.to, _tx.token, _tx.amount, _tx.nonce))
        ).recover(_signature);

        return signer == _tx.from && nonces[_tx.from] == _tx.nonce;
    }

    /// @dev Main batch transfer function for bundled meta transactions
    function batchTransfer(MetaTxWithSig[] calldata _metaTxWithSig, uint256 gas) external {
        uint256 transactionsLength = _metaTxWithSig.length;

        for (uint256 i = 0; i < transactionsLength; ++i) {
            bytes calldata signature = _metaTxWithSig[i].signature;
            MetaTx calldata metaTx = _metaTxWithSig[i].metaTx;

            if (verify(metaTx, signature) && allowedTokens[metaTx.token] && metaTx.to != address(0)) {
                nonces[metaTx.from] = nonces[metaTx.from] + 1;
                IERC20(metaTx.token).transferFrom(metaTx.from, metaTx.to, metaTx.amount);
            }

            require(gasleft() > gas / 63, "Not enough gas");
        }
    }
}
