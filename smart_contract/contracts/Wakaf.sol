// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Wakaf is Ownable {
    struct MoneyOut {
        uint256 amount;
        address tokenAddress;
        string reason;
    }

    mapping(address => bool) public nazir;
    mapping(address => MoneyOut[]) public moneyOutList;
    mapping(address => uint256) public totalMoneyOut;

    event NazirAdded(address nazir);
    event NazirRemoved(address nazir);
    event MoneyOutEvent(
        address nazir,
        address sendTo,
        uint256 amount,
        address tokenAddress,
        string reason
    );

    error NotNazir();
    error ExceedArrayLength();
    error InsufficientBalance();

    constructor(address initialNazir) Ownable(initialNazir) {
        nazir[initialNazir] = true;
    }

    function addNazir(address newNazir) public onlyOwner {
        nazir[newNazir] = true;
        emit NazirAdded(newNazir);
    }

    function removeNazir(address nazirToRemove) public onlyOwner {
        nazir[nazirToRemove] = false;
        emit NazirRemoved(nazirToRemove);
    }

    function getNazir(address _nazir) public view returns (bool) {
        return nazir[_nazir];
    }

    function getMoneyOut(
        address _nazir,
        uint256 _index
    ) public view returns (MoneyOut memory) {
        if (_index >= moneyOutList[_nazir].length) {
            revert ExceedArrayLength();
        }

        return moneyOutList[_nazir][_index];
    }

    // nazir can manage the money here
    function moneyOut(
        address tokenAddress,
        uint256 amount,
        address sendTo,
        string memory reason
    ) public {
        if (!nazir[msg.sender]) {
            revert NotNazir();
        }

        ERC20 token = ERC20(tokenAddress);
        if (token.balanceOf(address(this)) < amount) {
            revert InsufficientBalance();
        }

        token.transfer(sendTo, amount);
        moneyOutList[msg.sender].push(
            MoneyOut({
                amount: amount,
                tokenAddress: tokenAddress,
                reason: reason
            })
        );

        totalMoneyOut[tokenAddress] += amount;

        // emit event
        emit MoneyOutEvent(msg.sender, sendTo, amount, tokenAddress, reason);
    }

    function getMoneyOutCount(
        address _tokenAddress
    ) public view returns (uint256) {
        return moneyOutList[_tokenAddress].length;
    }
}
