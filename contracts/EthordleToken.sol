// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthordleToken is ERC721, Ownable {
    
using Strings for uint256;
    
    mapping (uint256 => string) private _tokenURIs;
    mapping (uint256 => address) private _tokenAccounts;
    mapping (string => address) private _solutionOwners;

    uint256 private _initialPrice;
    uint256 private _royaltyRate;
    uint256 private _currentTokenId;
    string private _baseURIextended;

    event TokenMinted (
        string solution,
        address payable account,
        uint256 tokenId,
        string metadataURI
    );

    constructor(string memory _name, string memory _symbol, uint256 initialPrice_, uint256 royaltyRate_) ERC721(_name, _symbol) {
        _currentTokenId = 0;
        _initialPrice = initialPrice_;
        _royaltyRate = royaltyRate_;
    }
    
    function setInitialPrice(uint256 initialPrice_) external onlyOwner() {
        _initialPrice = initialPrice_;
    }

    function initialPrice() external view returns (uint256) {
        return _initialPrice;
    }

    function setRoyaltyRate(uint256 royaltyRate_) external onlyOwner() {
        _royaltyRate = royaltyRate_;   
    }

    function royaltyRate() external view returns (uint256) {
        return _royaltyRate;
    }

    function getMintedTokenCount() external view returns (uint256) {
        return _currentTokenId;
    }

    function getMintedTokensOfOwner(address _from) external view returns(uint256[] memory ownerTokenIds) {
        uint256 tokenCount = balanceOf(_from);

        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 resultIndex = 0;
            uint256 tokenId;

            for (tokenId = 0; tokenId < _currentTokenId; tokenId++) {
                if (_tokenAccounts[tokenId] == _from) {
                    result[resultIndex] = tokenId;
                    resultIndex++;
                }
            }

            return result;
        }
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner() {
        _baseURIextended = baseURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "TokenId does not exist");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        
        return string(abi.encodePacked(base, tokenId.toString()));
    }
    
    function mint(
        address payable to,
        string memory solution,
        string memory tokenURI_
    ) external payable {        
        require(msg.value >= _initialPrice, 'Insufficient ether sent with this transaction'); 
        require(_solutionOwners[solution] == address(0x0), 'A token has already been minted with this solution');
        payable(owner()).transfer(msg.value);

        _mint(to, _currentTokenId);

        _tokenURIs[_currentTokenId] = tokenURI_;
        _tokenAccounts[_currentTokenId] = to;
        _solutionOwners[solution] = to;
        _currentTokenId++;        
        
        emit TokenMinted(solution, to, _currentTokenId, tokenURI_);
    }

    function transfer(
        address from, 
        address to, 
        uint256 tokenId
    ) external payable  {
        /*
        require(msg.value > 0, 'Invalid payment');
        require(from != address(0x0), 'Invalid from address');
        require(from == _msgSender(), 'From address is not msgSender');
        require(to != address(0x0), 'Invalid to address');
        require(_exists(tokenId), "TokenId does not exist");   
        require(_isApprovedOrOwner(_msgSender(), tokenId), 'msgSender is not the owner of the token');
        */
        //payRoyalty(msg.value);
        
        _transfer(from, to, tokenId);
    }
    
    function payRoyalty(
        uint256 value
    ) private {
        uint256 totalRoyalty = _royaltyRate * value;  // todo need safe multiply
        payable(owner()).transfer(totalRoyalty);
    }
}
