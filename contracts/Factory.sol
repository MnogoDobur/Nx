// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./myProxy.sol";
import "./Ticket.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Factory{
    using Counters for Counters.Counter;

    mapping(uint256 => address) private addressesProxies;
    Counters.Counter private counter;
    address ticketAddress;

    //returns proxy address at position x
    function getProxyAddress(uint256 id) public view returns(address) {
        return addressesProxies[id];
    }

    function getTicketAddress() public view returns(address){
        return ticketAddress;
    }

    //deploys Ticket and Proxy. Initialize the initializer(constructor) of Ticket
    //add the proxy address to the mapping
    function createProxyContract(string memory _name, string memory _symbol,uint _salt) public {
        Ticket ticket = new Ticket{salt: bytes32(_salt)}
        ();
        ticketAddress = address(ticket);
        myProxy newProxy = new myProxy(address(ticket), abi.encodeWithSelector(Ticket(address(0)).initialize.selector, _name, _symbol));
        uint256 currentCounter = counter.current();
        addressesProxies[currentCounter] = address(newProxy);
        counter.increment();
    }
}