// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthordleToken is ERC721PresetMinterPauserAutoId {
    
    using Strings for uint256;
    
    // Optional mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;
   
    uint256 private _mintedTokenCount;
    string private _baseURIextended;
    
    constructor(string memory _name, string memory _symbol, string memory _baseTokenURI)
        ERC721PresetMinterPauserAutoId(_name, _symbol, _baseTokenURI);
    {}
    
    function setBaseURI(string memory baseURI_) external onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function getMintedTokenCount() public view returns (uint256) {
        return _mintedTokenCount;
    }
    
    function _setTokenDetails(uint256 tokenId, string memory _tokenURI) virtual internal {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
    }
    
    function mint(
        address _to,
        string memory tokenURI_
    ) external {        
        _safeMint(_to, _mintedTokenCount);
        _setTokenURI(_mintedTokenCount, tokenURI_);
        _mintedTokenCount++;
    }
}
