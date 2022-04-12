const { expect } = require('chai');
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const EthordleToken = artifacts.require("./EthordleToken.sol");

// Start test block
contract('EthordleToken', function ([creator, other, holder]) {

    const name = 'Ethordle Token';
    const symbol = 'EthordleToken';
    const baseURI = '';
    const initialPrice = '1000000000000000000';
    const royaltyRate = '500';
    const solution = 'STARE';
    const tokenURI = 'http://ethordle.com';

    beforeEach(async function () {
        this.token = await EthordleToken.new(name, symbol, initialPrice, royaltyRate, { from: creator });
    });

    it('has metadata', async function () {
        expect(await this.token.name()).to.be.equal(name);
        expect(await this.token.symbol()).to.be.equal(symbol);
        expect((await this.token.initialPrice()).toString()).to.be.equal(initialPrice);
        expect((await this.token.royaltyRate()).toString()).to.be.equal(royaltyRate);
    });

    it('minter can mint', async function () {
        const tokenIdZero = new BN('0');
        const receipt = await this.token.mint(holder, solution, tokenURI, { from: creator, value: initialPrice });

        expect(await this.token.ownerOf(tokenIdZero)).to.be.equal(holder);
        expect(await this.token.tokenURI(tokenIdZero)).to.be.equal(tokenURI);
        expectEvent(receipt, 'Transfer', { from: constants.ZERO_ADDRESS, to: holder, tokenId: tokenIdZero });
    });

    it('minted solution cannot be reused', async function () {
        const tokenIdZero = new BN('0');
        const receipt = await this.token.mint(holder, solution, tokenURI, { from: holder, value: initialPrice });

        await expectRevert(
            this.token.mint(other, solution, tokenURI, { from: other, value: initialPrice }), 
            'A token has already been minted with this solution'
        );
    });
/*
    it('non minter cannot mint', async function () {
        await expectRevert(
            this.token.mint(holder, solution, tokenURI, { from: other, value: initialPrice }), 
            'EthordleToken: must have minter role to mint'
        );
    });
    */
});
