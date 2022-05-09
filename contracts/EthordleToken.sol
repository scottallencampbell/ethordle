// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EthordleToken is
    ERC721Enumerable,
    ERC721Holder,
    ReentrancyGuard,
    Ownable,
    Pausable
{
    using Strings for uint256;
    using SafeMath for uint256;

    struct Token {
        uint256 price;
        uint256 lastPrice;
        string url;
        string solution;
        uint256 lastTransactionTimestamp;
        uint256 transactionCount;
    }

    // Represents an sale on an NFT
    struct Sale {
        // Current owner of NFT
        address seller;
        // Price (in wei) at beginning of sale
        uint256 price;
    }

    mapping(uint256 => Token) public _tokens;
    mapping(string => address) private _solutionOwners;
    mapping(string => address) private _tokenURIOwners;

    uint256 private _initialPrice;
    uint256 private _royaltyRate;
    uint256 private _priceEscalationRate;
    uint256 private _currentTokenId;
    string private _baseURIextended;
    string private _password;
    uint256 private _roundingDivisor = 10**15;

    // Map from token ID to their corresponding sale.
    mapping(uint256 => Sale) private tokenIdToSales;
    // Save Sale Token Ids
    uint256[] public saleTokenIds;
    // Sale Token Ids by Seller Addresses
    mapping(address => uint256[]) private saleTokenIdsBySeller;
    event Minted(uint256 tokenId, address minter);
    event SaleCreated(
        address seller,
        uint256 tokenId,
        uint256 price,
        string solution,
        string metadataURI
    );
    event SaleCanceled(
        string solution,
        address account,
        uint256 tokenId,
        string metadataURI
    );
    event SaleSuccessful(
        uint256 tokenId,
        uint256 totalPrice,
        address buyer,
        string solution,
        string metadataURI
    );

    modifier onSale(uint256 tokenId) {
        require(tokenIdToSales[tokenId].price > 0, "Not On Sale");
        _;
    }

    modifier notOnSale(uint256 tokenId) {
        require(tokenIdToSales[tokenId].price == 0, "Already On Sale");
        _;
    }

    modifier owningToken(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Not owner of that token");
        _;
    }

    modifier onlySeller(uint256 tokenId) {
        require(
            tokenIdToSales[tokenId].seller == msg.sender,
            "Caller is not seller"
        );
        _;
    }

    modifier onlyBuyer(uint256 tokenId) {
        require(
            tokenIdToSales[tokenId].seller != msg.sender,
            "Caller is seller"
        );
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 initialPrice_,
        uint256 royaltyRate_,
        uint256 priceEscalationRate_,
        string memory password_
    ) ERC721(_name, _symbol) {
        _currentTokenId = 0;
        _initialPrice = initialPrice_;
        _royaltyRate = royaltyRate_;
        _priceEscalationRate = priceEscalationRate_;
        _password = password_;
    }

    modifier requirePassword(string memory password_) {
        require(
            _compareStrings(_password, password_),
            "A valid password is required to call this function"
        );
        _;
    }

    function _compareStrings(string memory a, string memory b)
        public
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function _validateTokenId(uint256 tokenId)
        internal
        view
        returns (Token memory)
    {
        require(_exists(tokenId), "TokenId does not exist");

        Token memory token = _tokens[tokenId];

        require(
            ownerOf(tokenId) != address(0x0),
            "Token object does not exist"
        );

        return token;
    }

    function setInitialPrice(uint256 initialPrice_) external onlyOwner {
        _initialPrice = initialPrice_;
    }

    function initialPrice() external view returns (uint256) {
        return _initialPrice;
    }

    function setRoyaltyRate(uint256 royaltyRate_) external onlyOwner {
        _royaltyRate = royaltyRate_;
    }

    function royaltyRate() external view returns (uint256) {
        return _royaltyRate;
    }

    function setPriceEscalationRate(uint256 priceEscalationRate_)
        external
        onlyOwner
    {
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

    function tokenById(uint256 tokenId) external view returns (Token memory) {
        Token memory token = _validateTokenId(tokenId);
        return token;
    }

    function tokensOfOwner(address _from)
        external
        view
        returns (Token[] memory)
    {
        uint256 ownerCount = balanceOf(_from);
        uint256 ownerIndex = 0;
        Token[] memory ownerTokens = new Token[](ownerCount);

        if (ownerCount > 0) {
            Token[] memory allTokens = this.tokens();

            for (uint256 i = 0; i < _currentTokenId; i++) {
                if (ownerOf(i) == _from) {
                    ownerTokens[ownerIndex] = allTokens[i];
                    ownerIndex++;
                }
            }
        }

        return ownerTokens;
    }

    function tokens() external view returns (Token[] memory) {
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

    function isSolutionUnique(string memory solution_)
        public
        view
        returns (bool)
    {
        return _solutionOwners[solution_] == address(0x0);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        Token memory token = _validateTokenId(tokenId);

        return token.url;
    }

    function mint(
        address payable to,
        string memory solution_,
        string memory tokenURI_,
        string memory password_
    ) external payable nonReentrant requirePassword(password_) {
        require(
            msg.sender == to || msg.sender == owner(),
            "Invalid to address"
        );
        require(
            msg.value >= _initialPrice,
            "Insufficient ether sent with this transaction"
        );
        require(
            _solutionOwners[solution_] == address(0x0),
            "A token has already been minted with this solution"
        );
        require(
            _tokenURIOwners[tokenURI_] == address(0x0),
            "A token has already been minted with this URI"
        );
        require(
            bytes(solution_).length >= 5,
            "A value for solution is required"
        );
        require(
            bytes(tokenURI_).length >= 28,
            "A value for tokenURI is required"
        ); // https://ipfs.infura.io/ipfs/

        payable(owner()).transfer(msg.value);

        _mint(to, _currentTokenId);

        uint256 newPrice = _getEscalatedPrice(msg.value);

        Token memory token = Token(
            newPrice,
            _initialPrice,
            tokenURI_,
            solution_,
            block.timestamp,
            1
        );

        _tokens[_currentTokenId] = token;
        _solutionOwners[solution_] = to;
        _tokenURIOwners[tokenURI_] = to;
        emit Minted(_currentTokenId, to);
        _currentTokenId++;
    }

    /// @dev Creates and begins a new sale.
    /// @param _tokenId - ID of token to sale, sender must be owner.
    /// @param price - Price of item (in wei) at beginning of sale.
    ///  price and ending price (in seconds).
    function createSale(uint256 _tokenId, uint256 price)
        external
        whenNotPaused
        owningToken(_tokenId)
    {
        Token memory token = _validateTokenId(_tokenId);

        safeTransferFrom(msg.sender, address(this), _tokenId, "0x0000");
        require(
            price >= token.price,
            "Token cannot be priced less than the current asking price"
        );

        uint256 newPrice = price.div(_roundingDivisor).mul(_roundingDivisor); // round to nearest 1/1000 eth
        token.price = newPrice;

        _tokens[_tokenId] = token;

        Sale memory _sale = Sale(msg.sender, newPrice);

        tokenIdToSales[_tokenId] = _sale;
        saleTokenIds.push(_tokenId);
        saleTokenIdsBySeller[_sale.seller].push(_tokenId);

        emit SaleCreated(
            msg.sender,
            uint256(_tokenId),
            uint256(_sale.price),
            token.solution,
            token.url
        );
    }

    /// @dev Cancels a sale that hasn't been won yet.
    ///  Returns the NFT to original owner.
    /// @notice This is a state-modifying function that can
    ///  be called while the contract is paused.
    /// @param _tokenId - ID of token on sale
    function cancelSale(uint256 _tokenId)
        external
        onSale(_tokenId)
        onlySeller(_tokenId)
    {
        _cancelSale(_tokenId);
    }

    /// @dev Cancels an sale when the contract is paused.
    ///  Only the owner may do this, and NFTs are returned to
    ///  the seller. This should only be used in emergencies.
    /// @param _tokenId - ID of the NFT on sale to cancel.
    function cancelSaleWhenPaused(uint256 _tokenId)
        external
        whenPaused
        onlyOwner
        onSale(_tokenId)
    {
        _cancelSale(_tokenId);
    }

    /// @dev Cancels a sale unconditionally.
    /// @param _tokenId - ID of the token price we are canceling.
    function _cancelSale(uint256 _tokenId) internal {
        _transfer(address(this), tokenIdToSales[_tokenId].seller, _tokenId);
        _removeSale(_tokenId);
        Token memory token = _validateTokenId(_tokenId);
        emit SaleCanceled(
            token.solution,
            ownerOf(_tokenId),
            _tokenId,
            token.url
        );
    }

    /// @dev Removes an sale from the list of open sales.
    /// @param _tokenId - ID of NFT on sale.
    function _removeSale(uint256 _tokenId) internal {
        // remove saleTokenIds[i]
        uint256 i;
        uint256 length = saleTokenIds.length;
        for (i = 0; i < length; ++i) {
            if (saleTokenIds[i] == _tokenId) {
                break;
            }
        }
        require(i < length, "No sale for this NFT");
        saleTokenIds[i] = saleTokenIds[length - 1];
        saleTokenIds.pop();
        // remove saleTokenIdsBySeller[sale.seller][i]
        Sale storage sale = tokenIdToSales[_tokenId];
        length = saleTokenIdsBySeller[sale.seller].length;
        for (i = 0; saleTokenIdsBySeller[sale.seller][i] != _tokenId; ) {
            ++i;
        }
        saleTokenIdsBySeller[sale.seller][i] = saleTokenIdsBySeller[
            sale.seller
        ][length - 1];
        saleTokenIdsBySeller[sale.seller].pop();
        // remove tokenIdToSales[_tokenId]
        delete tokenIdToSales[_tokenId];
    }

    function getSaleTokens() public view returns (uint256[] memory) {
        return saleTokenIds;
    }

    function getSaleTokensBySeller(address seller)
        public
        view
        returns (uint256[] memory)
    {
        return saleTokenIdsBySeller[seller];
    }

    /// @dev Buys on an open sale, completing the sale and transferring
    ///  ownership of the NFT if enough Ether is supplied.
    /// @param tokenId - ID of token to buy on.
    function buy(uint256 tokenId, string memory password_)
        external
        payable
        virtual
        nonReentrant
        whenNotPaused
        onSale(tokenId)
        onlyBuyer(tokenId)
        requirePassword(password_)
    {
        Token memory token = _validateTokenId(tokenId);
        // Get a reference to the sale struct
        Sale storage sale = tokenIdToSales[tokenId];

        require(
            msg.value >= token.price,
            "Insufficient ether sent with this transaction"
        );

        string memory solution_ = token.solution;
        string memory tokenURI_ = token.url;
        uint256 totalRoyalty = _getRoyalty(msg.value);
        uint256 remainder = msg.value - totalRoyalty;
        require(remainder >= sale.price, "Insufficient fund to buy token");

        payable(owner()).transfer(totalRoyalty);
        payable(sale.seller).transfer(sale.price);
        _transfer(address(this), msg.sender, tokenId);

        _removeSale(tokenId);

        // Update _tokens
        _solutionOwners[solution_] = msg.sender;
        _tokenURIOwners[tokenURI_] = msg.sender;

        token.lastPrice = token.price;
        token.price = _getEscalatedPrice(msg.value);
        token.lastTransactionTimestamp = block.timestamp;
        token.transactionCount++;

        _tokens[tokenId] = token;

        // Tell the world!
        emit SaleSuccessful(
            tokenId,
            sale.price,
            msg.sender,
            token.solution,
            token.url
        );
    }

    function _getRoyalty(uint256 value) private view returns (uint256) {
        return value.mul(_royaltyRate).div(10000);
    }

    function _getEscalatedPrice(uint256 value) private view returns (uint256) {
        uint256 newPrice = value.mul(_priceEscalationRate).div(10000);

        return newPrice.div(_roundingDivisor).mul(_roundingDivisor); // round off new price to nearest 1/1000 eth
    }
}
