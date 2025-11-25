// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockIDR is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @notice Initialize the StableCoin token
     * @param owner_ Owner of the token
     * @param initialHolders_ Addresses of the initial holders
     */
    constructor(
        address owner_,
        address[] memory initialHolders_
    ) ERC20("DummyRupiah", "IDR") Ownable(owner_) {
        // Set decimals
        _decimals = 6;

        // mint supply to owner and initial holders
        _mint(owner_, 1000000000 * 10 ** _decimals);
        for (uint256 i = 0; i < initialHolders_.length; i++) {
            _mint(initialHolders_[i], 1000000000 * 10 ** _decimals);
        }
    }

    /**
     * @notice Mint tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from a specific address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @notice Get token decimals
     * @return Number of decimals (6)
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
