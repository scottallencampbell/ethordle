// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthordleToken is ERC721, Ownable {
    
using Strings for uint256;
    
    mapping (uint256 => string) private _tokenSolutions;
    mapping (uint256 => string) private _tokenURIs;
    mapping (uint256 => address) private _tokenAccounts;
    mapping (uint256 => uint256) public _tokenPrices;
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

    function tokenCount() external view returns (uint256) {
        return _currentTokenId;
    }

    function tokensOfOwner(address _from) external view returns(uint256[] memory) {
        uint256 tokens = balanceOf(_from);

        if (tokens == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokens);
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
    
    function solution(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), 'TokenId does not exist');

        return _tokenSolutions[tokenId];
    }

    function isSolutionUnique(string memory solution_) public view returns (bool) {
        return _solutionOwners[solution_] == address(0x0);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), 'TokenId does not exist');

        return _tokenURIs[tokenId];
    }

    function price(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), 'TokenId does not exist');

        return _tokenPrices[tokenId];
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
        
        payable(owner()).transfer(msg.value);

        _mint(to, _currentTokenId);

        _tokenSolutions[_currentTokenId] = solution_;
        _tokenURIs[_currentTokenId] = tokenURI_;
        _tokenPrices[_currentTokenId] = _getEscalatedPrice(msg.value);
        _tokenAccounts[_currentTokenId] = to;
        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;
        _currentTokenId++;        
        
        emit TokenMinted(solution_, to, _currentTokenId, tokenURI_);
    }

    function buy(
        address to,
        uint256 tokenId
    ) external payable {        
        require(msg.sender == to, 'Invalid to address');
        require(_exists(tokenId), 'TokenId does not exist');   
        require(!_isApprovedOrOwner(_msgSender(), tokenId), "Buyer already owns token");   
        require(msg.value >= _tokenPrices[tokenId], 'Insufficient ether sent with this transaction');
       
        string memory solution_ = _tokenSolutions[tokenId];
        string memory tokenURI_ = _tokenURIs[tokenId];

        address from = _tokenAccounts[tokenId];
        uint256 totalRoyalty = _getRoyalty(msg.value); 
        uint256 remainder = msg.value - totalRoyalty;

        payable(owner()).transfer(totalRoyalty);
        payable(address(from)).transfer(remainder);

        _transfer(from, to, tokenId);

        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;
        _tokenAccounts[tokenId] = to;
        _tokenPrices[tokenId] = _getEscalatedPrice(msg.value);        
    }
    
    // todo how to prevent base _transfer from being called directly

    function _getRoyalty(uint256 value) private view returns (uint256) {
        return value * _royaltyRate / 10000 ;  // todo need safe multiply    
    }

    function _getEscalatedPrice(uint256 value) private view returns (uint256) {
        uint256 divisor = 10**15;
        uint256 newPrice = value * _priceEscalationRate / 10000 ;  // todo need safe multiply    
        
        return (newPrice / divisor) * divisor;  // round off new price to nearest 1E15
    }

    function transferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public pure override {
        require(false, 'Not implemented');
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public pure override {
        require(false, 'Not implemented');
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/,
        bytes memory /*_data*/
    ) public pure override {
        require(false, 'Not implemented');
    }
}