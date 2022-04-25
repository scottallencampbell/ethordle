// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthordleToken is ERC721, Ownable {
    
using Strings for uint256;
    
    struct Token {
        uint256 id;        
        address owner;
        uint256 price;
        string url;
        string solution;
        bool isForSale;
        uint256 transactionCount;        
    }

    mapping (uint256 => Token) public _tokens;
    mapping (string => address) private _solutionOwners;
    mapping (string => address) private _tokenURIOwners;

    address private _owner;
    uint256 private _initialPrice;
    uint256 private _royaltyRate;
    uint256 private _priceEscalationRate;
    uint256 private _currentTokenId;
    string private _baseURIextended;

    event TokenMinted (
        string solution,
        address payable account,
        uint256 tokenId,
        string metadataURI
    );

    constructor(string memory _name, string memory _symbol, uint256 initialPrice_, uint256 royaltyRate_, uint256 priceEscalationRate_) ERC721(_name, _symbol) {
        _owner = msg.sender;
        _currentTokenId = 0;
        _initialPrice = initialPrice_;
        _royaltyRate = royaltyRate_;
        _priceEscalationRate = priceEscalationRate_;
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

    function setPriceEscalationRate(uint256 priceEscalationRate_) external onlyOwner() {
        _priceEscalationRate = priceEscalationRate_;
    }

    function priceEscalationRate() external view returns (uint256) {
        return _priceEscalationRate;
    }

    function tokenCount() external view returns (uint256) {
        return _currentTokenId;
    }

    function tokenById(uint256 tokenId) external view returns(Token memory) {
        require(_exists(tokenId), 'TokenId does not exist');  

        Token memory token = _tokens[tokenId];
        require(_exists(tokenId), 'Token does not exist');   

        return token;
    }

    function tokensOfOwner(address _from) external view returns(Token[] memory) {
        uint256 ownerCount = balanceOf(_from);
        uint256 ownerIndex = 0;
        Token[] memory ownerTokens = new Token[](ownerCount);

        if (ownerCount > 0) {
            Token[] memory allTokens = this.tokens();
            
            for (uint256 i = 0; i < _currentTokenId; i++) {
                if (allTokens[i].owner == _from) {
                    ownerTokens[ownerIndex] = allTokens[i];
                    ownerIndex++;
                }
            }
        }

        return ownerTokens;
    }

    function tokens() external view returns(Token[] memory) {  
        Token[] memory allTokens = new Token[](_currentTokenId);

        for (uint256 i = 0; i < _currentTokenId; i++) {
            allTokens[i] = _tokens[i];
        }

        return allTokens;
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner() {
        _baseURIextended = baseURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }
    
    function isSolutionUnique(string memory solution_) public view returns (bool) {
        return _solutionOwners[solution_] == address(0x0);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), 'TokenId does not exist');

        return _tokens[tokenId].url;
    }

    function mint(
        address payable to,
        string memory solution_,
        string memory tokenURI_
    ) external payable {  
        require(msg.sender == to || msg.sender == _owner, 'Invalid to address');      
        require(msg.value >= _initialPrice, 'Insufficient ether sent with this transaction'); 
        require(_solutionOwners[solution_] == address(0x0), 'A token has already been minted with this solution');
        require(_tokenURIOwners[tokenURI_] == address(0x0), 'A token has already been minted with this URI');
        require(bytes(solution_).length >= 5, 'A value for solution is required');
        require(bytes(tokenURI_).length >= 28, 'A value for tokenURI is required'); // https://ipfs.infura.io/ipfs/

        payable(owner()).transfer(msg.value);

        _mint(to, _currentTokenId);

        uint256 newPrice =_getEscalatedPrice(msg.value);

        Token memory token = Token(_currentTokenId, to, newPrice, tokenURI_, solution_, false, 1);
       
        _tokens[_currentTokenId] = token;
        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;
        _currentTokenId++;        
        
        emit TokenMinted(solution_, to, _currentTokenId, tokenURI_);
    }

    function allowSale(
        address from,
        uint256 tokenId
    ) external {    
        toggleSale(from, tokenId, true);
    }

    function preventSale(
        address from,
        uint256 tokenId
    ) external {    
        toggleSale(from, tokenId, false);        
    }

    function toggleSale( 
        address from, 
        uint256 tokenId,
        bool markForSale
    ) private {
        require(_exists(tokenId), 'TokenId does not exist');   
        require(_msgSender() == from || _msgSender() == _owner, 'Sender must be token owner or contract owner'); 
        require(_isApprovedOrOwner(_msgSender(), tokenId), 'Sender must be token owner or contract owner');   

        Token memory token = _tokens[tokenId];
        require(_exists(token.id), 'Token does not exist');  
        require(markForSale != token.isForSale, markForSale ? 'Token is already marked for sale' : 'Token is already prevented from being sold'); 
        
        token.isForSale = markForSale;

        _tokens[tokenId] = token; 
    }

    function buy(
        address to,
        uint256 tokenId
    ) external payable {        
        require(_exists(tokenId), 'TokenId does not exist');   

        Token memory token = _tokens[tokenId];
        require(_exists(token.id), 'Token does not exist');        
        require(msg.value >= token.price, 'Insufficient ether sent with this transaction');
        require(token.isForSale, 'Token is not for sale');
        require(token.owner != to, 'Buyer already owns token'); 
       
        string memory solution_ = token.solution;
        string memory tokenURI_ = token.url;

        uint256 totalRoyalty = _getRoyalty(msg.value); 
        uint256 remainder = msg.value - totalRoyalty;

        payable(owner()).transfer(totalRoyalty);
        payable(address(token.owner)).transfer(remainder);
        
        _transfer(token.owner, to, tokenId);

        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;

        uint256 newPrice = _getEscalatedPrice(msg.value);

        token.owner = to;
        token.price = newPrice;
        token.isForSale = false;
        token.transactionCount++;       

        _tokens[tokenId] = token; 
    }
  
    function _getRoyalty(uint256 value) private view returns (uint256) {
        return value * _royaltyRate / 10000 ;  // todo need safe multiply    
    }

    function _getEscalatedPrice(uint256 value) private view returns (uint256) {
        uint256 divisor = 10**15;
        uint256 newPrice = value * _priceEscalationRate / 10000 ;  // todo need safe multiply    
        
        return (newPrice / divisor) * divisor;  // round off new price to nearest 1E15
    }
  
    // todo how to prevent base _transfer from being called directly

    function transferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public view override {
        require(_msgSender() == _owner, 'Method may only be called by the owner');
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public view override {
        require(_msgSender() == _owner, 'Method may only be called by the owner');
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/,
        bytes memory /*_data*/
    ) public view override {
        require(_msgSender() == _owner, 'Method may only be called by the owner');
    }
}