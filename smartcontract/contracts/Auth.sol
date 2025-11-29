// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

contract Auth {
    address public adminAddress;
    
    constructor(){
        adminAddress = msg.sender;
    }

    function isAdmin(address _id) public view returns (bool){
        return _id == adminAddress;
    }

    modifier isAuthorize(address _id) {
        require(_id == adminAddress, "Not authorized");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "Not authorized");
        _;
    }

}
