// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Ticket is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable
{
    uint256 private openingTime;
    string public baseURI;
    
    using Strings for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private counter;

    //Initializer - upgradability 
    function initialize(string memory _name, string memory _symbol)
        external
        initializer
    {
        __ERC721_init(_name, _symbol);
        __Ownable_init();
        transferOwnership(tx.origin);
        counter.reset();
        counter.increment();
        baseURI = "ipfs://QmNyUdzfrdTsSaYDLL3KsW3AD9r35FoLzy4Y9nfPYmmubQ/";
    }


    //returns cost for x mints
    function getCost(uint256 quantity) public pure returns(uint256){
        return 0.02 ether*quantity;
    }

    //owner starts the sale
    function startSale() public onlyOwner(){//initiates a 1 day long  sale
        openingTime = block.timestamp;
    }
    
    
    function ethBalance() external view returns(uint256){
        return address(this).balance;
    }

    //check if sale is undergoing
    function undergoingSale() public view returns(bool){
        if(block.timestamp > openingTime && block.timestamp < openingTime + 1 days){
            return true;
        }
        return false;
    }

    //function modifier for checking passed cost from frontend
    modifier checkSale(uint256 quantity){
        require(msg.value == getCost(quantity),"Eth passed is less or greater than required");
        _;
    }

    //mints x amount of NFTs
    //checks for total amount, if sale is active and sets maximum amount of 10 Tickets per transaction (gas related)
    function mintNft(uint256 quantity) external payable checkSale(quantity) {
        require(undergoingSale() == true,"Sale hasn't started yet");
        require(counter.current()<10001,"Ticket limit reached");
        require(quantity<11,"Too many mints per 1 transaction - can run out of gas");

        _mintLoop(msg.sender,quantity);
    }

    function _mintLoop(address _receiver, uint256 _mintQuantity) internal {
        for (uint256 i = 0; i < _mintQuantity; i++) {
            _safeMint(_receiver, counter.current());
            counter.increment();
        }
    }

    //very simple pseudo-random generation
    function getRand() public view returns(uint){
        uint salt = 3;
        return uint(keccak256(abi.encodePacked(salt))) % counter.current();
    }

    //owner closes current sale. All ether in the contract is forwarded to a random holder
    function closeSale() external onlyOwner(){
        uint number = getRand();
        address payable winner = payable(address(IERC721Upgradeable(address(this)).ownerOf(number)));
        winner.transfer(address(this).balance);
    }

    //owner chooses a "surprise winner". That address is passed 50% of the ether in the contract
    function surpriseWinner() external onlyOwner(){
        uint number = getRand();
        address payable winner = payable(address(IERC721Upgradeable(address(this)).ownerOf(number)));
        winner.transfer(address(this).balance/2);
    }

    //format metadata pointer
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
        require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), ".json"))
            : "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}