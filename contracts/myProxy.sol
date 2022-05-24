// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract myProxy is ERC1967Proxy {
    uint32 private version;
    
    constructor(address _logic, bytes memory _data) ERC1967Proxy(_logic, _data) {}

    function versionProxy() public view returns(uint32) {
        return version;
    }

    function getImplementation() public view returns(address){
        return super._getImplementation();
    }

    function upgradeTo(address implementation) public {
        super._upgradeTo(implementation);
    }
}
