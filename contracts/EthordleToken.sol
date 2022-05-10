// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // ERC721Enumerable
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EthordleToken is ERC721, ReentrancyGuard, Ownable {
    using Strings for uint256;
    using SafeMath for uint256;

    struct Token {
        uint256 id;        
        address owner;
        uint256 price;
        uint256 lastPrice;
        string url;
        string solution;
        bool isForSale;
        uint256 lastTransactionTimestamp;
        uint256 transactionCount;        
    }

    mapping (uint256 => Token) public _tokens;
    mapping (string => address) private _solutionOwners;
    mapping (string => address) private _tokenURIOwners;

    uint256 private _initialPrice;
    uint256 private _minimumPrice;
    uint256 private _royaltyRate;
    uint256 private _priceEscalationRate;
    uint256 private _currentTokenId;
    string private _baseURIextended;
    string private _password;
    uint256 private _roundingDivisor = 10**15;

    event Minted (
        uint256 tokenId,
        address owner,
        uint256 price,
        string solution,
        string metadataURI
    );

    event SaleCreated (
        uint256 tokenId,
        address seller,
        uint256 price,
        string solution,
        string metadataURI
    );

    event SaleCanceled (
        uint256 tokenId,        
        address seller,
        string solution,
        string metadataURI
    );

    event SaleSuccessful (
        uint256 tokenId,        
        address buyer,
        address seller,
        uint256 price,
        string solution,
        string metadataURI
    );

    event TransferSuccessful (
        uint256 tokenId, 
        address transferee, 
        string solution, 
        string metadataURI
    );

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 initialPrice_, 
        uint256 minimumPrice_, 
        uint256 royaltyRate_, 
        uint256 priceEscalationRate_, 
        string memory password_) 
    ERC721(_name, _symbol) {
        _currentTokenId = 0;
        _initialPrice = initialPrice_;
        _minimumPrice = minimumPrice_;
        _royaltyRate = royaltyRate_;
        _priceEscalationRate = priceEscalationRate_;
        _password = password_;
    }
    
    modifier requirePassword(string memory password_) {
      require (_compareStrings(_password, password_), 'A valid password is required to call this function');
      _;
    }

    function _compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function _validateTokenId(uint256 tokenId) internal view returns (Token memory) {
        require(_exists(tokenId), 'TokenId does not exist');
        
        Token memory token = _tokens[tokenId];    
        
        require(ownerOf(tokenId) != address(0x0), 'Token object does not exist');

        return token;
    }

    function setInitialPrice(uint256 initialPrice_) external onlyOwner {
        _initialPrice = initialPrice_;
    }
    
    function initialPrice() external view returns (uint256) {
        return _initialPrice;
    }
    
    function setMinimumPrice(uint256 minimumPrice_) external onlyOwner {
        _minimumPrice = minimumPrice_;
    }

    function minimumPrice() external view returns (uint256) {
        return _minimumPrice;
    }

    function setRoyaltyRate(uint256 royaltyRate_) external onlyOwner {
        _royaltyRate = royaltyRate_;   
    }

    function royaltyRate() external view returns (uint256) {
        return _royaltyRate;
    }

    function setPriceEscalationRate(uint256 priceEscalationRate_) external onlyOwner {
        _priceEscalationRate = priceEscalationRate_;
    }

    function priceEscalationRate() external view returns (uint256) {
        return _priceEscalationRate;
    }

    function setPassword(string memory password_) external onlyOwner {
        _password = password_;
    }

    function tokenCount() external view returns (uint256) {
        return _currentTokenId;
    }

    function tokenById(uint256 tokenId) external view returns(Token memory) {        
        Token memory token = _validateTokenId(tokenId);
        return token;
    }

    function tokensOfOwner(address _from) external view returns(Token[] memory) {
        uint256 ownerCount = balanceOf(_from);
        uint256 ownerIndex = 0;
        Token[] memory ownerTokens = new Token[](ownerCount);

        if (ownerCount > 0) {
            Token[] memory allTokens = this.tokens();
            
            for (uint256 i = 0; i < _currentTokenId; i++) {
                if (ownerOf(allTokens[i].id) == _from) {
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
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseURIextended = baseURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }
    
    function isSolutionUnique(string memory solution_) public view returns (bool) {
        return _solutionOwners[solution_] == address(0x0);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        Token memory token = _validateTokenId(tokenId);

        return token.url;
    }

    function mint(
        address payable to,
        string memory solution_,
        string memory tokenURI_,
        string memory password_
    ) external payable nonReentrant requirePassword(password_) {  
        require(msg.sender == to || msg.sender == owner(), 'Invalid to address');      
        require(msg.value >= _initialPrice, 'Insufficient ether sent with this transaction'); 
        require(_solutionOwners[solution_] == address(0x0), 'A token has already been minted with this solution');
        require(_tokenURIOwners[tokenURI_] == address(0x0), 'A token has already been minted with this URI');
        require(bytes(solution_).length >= 5, 'A value for solution is required');
        require(bytes(tokenURI_).length >= 28, 'A value for tokenURI is required'); // https://ipfs.infura.io/ipfs/
        
        payable(owner()).transfer(msg.value);

        _mint(to, _currentTokenId);

        uint256 newPrice =_getEscalatedPrice(msg.value);

        Token memory token = Token(_currentTokenId, to, newPrice, _initialPrice, tokenURI_, solution_, false, block.timestamp, 1);
       
        _tokens[_currentTokenId] = token;
        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;
        _currentTokenId++;   

        emit Minted(_currentTokenId, to, newPrice, solution_, tokenURI_);     
    }

    function createSale(uint256 tokenId, uint256 price) external {    
        Token memory token = _validateTokenId(tokenId);
        
        require(msg.sender == owner() || _isApprovedOrOwner(msg.sender, tokenId), 'Sender must be token owner or contract owner'); 
        require(!token.isForSale, 'Token is already marked for sale');
        require(price >= token.price, 'Token cannot be priced less than the current asking price');
        require(price >= _minimumPrice, 'Token cannot be priced less than the current minimum price');
        
        token.price = price.div(_roundingDivisor).mul(_roundingDivisor); // round to nearest 1/1000 eth
        token.isForSale = true;

        _tokens[tokenId] = token; 

        emit SaleCreated(tokenId, msg.sender, price, token.solution, token.url);
    }

    function cancelSale(uint256 tokenId) external {   
        Token memory token = _validateTokenId(tokenId);

        require(msg.sender == owner() || _isApprovedOrOwner(msg.sender, tokenId), 'Sender must be token owner or contract owner'); 
        
        require(token.isForSale, 'Token is already prevented from being sold'); 
        
        token.isForSale = false;
        
        _tokens[tokenId] = token; 

        emit SaleCanceled(tokenId, msg.sender, token.solution, token.url);
    }

    function buy(uint256 tokenId, string memory password_) external payable nonReentrant requirePassword(password_) {      
        Token memory token = _validateTokenId(tokenId);
        
        require(msg.value >= token.price, 'Insufficient ether sent with this transaction');
        require(token.isForSale, 'Token is not for sale');
        require(ownerOf(tokenId) != msg.sender, 'Buyer already owns token'); 
       
        string memory solution_ = token.solution;
        string memory tokenURI_ = token.url;

        uint256 totalRoyalty = _getRoyalty(msg.value); 
        uint256 remainder = msg.value - totalRoyalty;

        payable(owner()).transfer(totalRoyalty);
        payable(address(ownerOf(tokenId))).transfer(remainder);
        
        _transfer(ownerOf(tokenId), msg.sender, tokenId);

        _solutionOwners[solution_] = msg.sender;
        _tokenURIOwners[tokenURI_] = msg.sender;

        uint256 newPrice = _getEscalatedPrice(msg.value);
        address oldOwner = ownerOf(tokenId);

        token.owner = msg.sender;
        token.lastPrice = token.price;
        token.price = newPrice;
        token.isForSale = false;
        token.lastTransactionTimestamp = block.timestamp;
        token.transactionCount++;       

        _tokens[tokenId] = token; 

        emit SaleSuccessful(tokenId, msg.sender, oldOwner, newPrice, token.solution, token.url);
    }
    
    function transferAsContractOwner(uint256 tokenId, address to) external payable nonReentrant onlyOwner {        
        Token memory token = _validateTokenId(tokenId);
        
        require(ownerOf(tokenId) != to, 'Buyer already owns token'); 
       
        string memory solution_ = token.solution;
        string memory tokenURI_ = token.url;
  
        _transfer(ownerOf(tokenId), to, tokenId);

        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;

        token.owner = to;
        token.isForSale = false;
        token.lastTransactionTimestamp = block.timestamp;
        token.transactionCount++;       

        _tokens[tokenId] = token; 

        emit TransferSuccessful(tokenId, to, token.solution, token.url);
    }

    function _getRoyalty(uint256 value) private view returns (uint256) {
        return value.mul(_royaltyRate).div(10000);
    }

    function _getEscalatedPrice(uint256 value) private view returns (uint256) {
        uint256 newPrice = value.mul(_priceEscalationRate).div(10000);
        uint256 updatedPrice = newPrice.div(_roundingDivisor).mul(_roundingDivisor);  // round off new price to nearest 1/1000 eth

        if (updatedPrice < _minimumPrice) {
            return _minimumPrice;
        }
        else {
            return updatedPrice;
        }
    }
  
     function transferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public view override onlyOwner {
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public view override onlyOwner {
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/,
        bytes memory /*_data*/
    ) public view override onlyOwner {
    }
}