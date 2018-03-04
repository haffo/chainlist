pragma solidity ^0.4.18;


contract Ownable {

  address owner;

  modifier onlyOwner () {
    require (owner == msg.sender);
    _;
  }

  function Ownable() public {
    owner = msg.sender;
  }


}
