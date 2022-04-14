const { expect } = require('chai');
const { expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const EthordleToken = artifacts.require("./EthordleToken.sol");
const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const { BADNAME } = require('dns');

chai.use(bnChai(BN));

// Start test block
contract('EthordleToken', function ([owner, winner, other, transferee]) {

    const name = 'Ethordle Token';
    const symbol = 'EthordleToken';
    const baseURI = '';
    const initialPrice = web3.utils.toWei(new BN(1), 'ether'); 
    const royaltyRate = '500';
    const priceEscalationRate = '11000';
    const solution = 'STARE';
    const otherSolutions = ['CHOMP', 'SPORK', 'BLURT'];
    const tokenURI = 'http://ethordle.com';
    const otherTokenURIs = ['http://ethordle.com/1', 'http://ethordle.com/2', 'http://ethordle.com/3'];

    beforeEach(async function () {
        this.token = await EthordleToken.new(name, symbol, initialPrice, royaltyRate, priceEscalationRate, { from: owner });
    });

    it('has metadata', async function () {
        expect(await this.token.name()).to.equal(name);
        expect(await this.token.symbol()).to.equal(symbol);
        expect((await this.token.initialPrice()).toString()).to.equal(initialPrice.toString());
        expect((await this.token.royaltyRate()).toString()).to.equal(royaltyRate);
    });

    it('minter can mint token', async function () {
        const receipt = await this.token.mint(winner, solution, tokenURI, { from: owner, value: initialPrice });

        expect(await this.token.ownerOf(0)).to.equal(winner);
        expect(await this.token.solution(0)).to.equal(solution);
        expect(await this.token.tokenURI(0)).to.equal(tokenURI);

        const price = (await this.token.price(0)).toString();
        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000')).toString();
        expect(price).to.equal(expectedPrice);
        
        const tokens = await this.token.tokensOfOwner(winner);

        expect(tokens.length).to.equal(1);
        expect(tokens[0]).is.a.bignumber.that.equals(new BN(0));

        expectEvent(receipt, 'Transfer', { from: constants.ZERO_ADDRESS, to: winner, tokenId: '0' });
    });
 
    it('normal account can mint token', async function () {
        const receipt = await this.token.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });

        expect(await this.token.ownerOf(0)).to.equal(winner);
        expect(await this.token.solution(0)).to.equal(solution);
        expect(await this.token.tokenURI(0)).to.equal(tokenURI);

        const tokens = await this.token.tokensOfOwner(winner);

        expect(tokens.length).to.equal(1);
        expect(tokens[0]).is.a.bignumber.that.equals(new BN(0));

        expectEvent(receipt, 'Transfer', { from: constants.ZERO_ADDRESS, to: winner, tokenId: '0' });
    });

    it('normal account can mint multiple tokens', async function () {
        await this.token.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
        await this.token.mint(winner, otherSolutions[0], otherTokenURIs[0], { from: winner, value: initialPrice });
        await this.token.mint(winner, otherSolutions[1], otherTokenURIs[1], { from: winner, value: initialPrice });
        await this.token.mint(winner, otherSolutions[2], otherTokenURIs[2], { from: winner, value: initialPrice });

        expect(await this.token.ownerOf(0)).to.equal(winner);
        expect(await this.token.solution(0)).to.equal(solution);
        expect(await this.token.tokenURI(0)).to.equal(tokenURI);   
        
        expect(await this.token.ownerOf(1)).to.equal(winner);
        expect(await this.token.solution(1)).to.equal(otherSolutions[0]);
        expect(await this.token.tokenURI(1)).to.equal(otherTokenURIs[0]);  

        expect(await this.token.ownerOf(2)).to.equal(winner);
        expect(await this.token.solution(2)).to.equal(otherSolutions[1]);
        expect(await this.token.tokenURI(2)).to.equal(otherTokenURIs[1]);
        
        expect(await this.token.ownerOf(3)).to.equal(winner);
        expect(await this.token.solution(3)).to.equal(otherSolutions[2]);
        expect(await this.token.tokenURI(3)).to.equal(otherTokenURIs[2]);  

        const tokens = await this.token.tokensOfOwner(winner);

        expect(tokens.length).to.equal(4);
        expect(tokens[0]).is.a.bignumber.that.equals(new BN(0));
        expect(tokens[1]).is.a.bignumber.that.equals(new BN(1));
        expect(tokens[2]).is.a.bignumber.that.equals(new BN(2));
        expect(tokens[3]).is.a.bignumber.that.equals(new BN(3));
    });

    it('minted solution cannot be reused', async function () {
        await this.token.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });

        await expectRevert(
            this.token.mint(other, solution, otherTokenURIs[0], { from: other, value: initialPrice }), 
            'A token has already been minted with this solution'
        );
    });

    it('minted token URI cannot be reused', async function () {
        await this.token.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });

        await expectRevert(
            this.token.mint(other, otherSolutions[0], tokenURI, { from: other, value: initialPrice }), 
            'A token has already been minted with this URI'
        );
    });

    it('insufficient value sent is rejected', async function () {
        await expectRevert(
            this.token.mint(winner, solution, tokenURI, { from: owner, value: initialPrice.sub(new BN('1000')) }), 
            'Insufficient ether sent with this transaction'
        );
    });

    it('transfers value to owner', async function () {
        const ownerBalance = await web3.eth.getBalance(owner);
        const winnerBalance = await web3.eth.getBalance(winner);
       
        const receipt0 = await this.token.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
        const receipt1 = await this.token.mint(winner, otherSolutions[0], otherTokenURIs[0], { from: winner, value: initialPrice });
        const receipt2 = await this.token.mint(winner, otherSolutions[1], otherTokenURIs[1], { from: winner, value: initialPrice });
        const receipt3 = await this.token.mint(winner, otherSolutions[2], otherTokenURIs[2], { from: winner, value: initialPrice });

        const gas0 = await getTransactionCost(receipt0);
        const gas1 = await getTransactionCost(receipt1);
        const gas2 = await getTransactionCost(receipt2);
        const gas3 = await getTransactionCost(receipt3);

        const newOwnerBalance = await web3.eth.getBalance(owner);
        const newWinnerBalance = await web3.eth.getBalance(winner);
        
        const expectedNewOwnerBalance = new BN(ownerBalance).add(initialPrice.mul(new BN('4')))
        expect(new BN(newOwnerBalance)).to.be.a.bignumber.that.equals(expectedNewOwnerBalance);

        const expectedNewWinnerBalance = new BN(winnerBalance).sub(initialPrice.mul(new BN('4'))).sub(gas0).sub(gas1).sub(gas2).sub(gas3);
        expect(new BN(newWinnerBalance)).to.be.a.bignumber.equals(expectedNewWinnerBalance);        
    });

    const getTransactionCost = async (receipt) => {
        const gasUsed = new BN(receipt.receipt.gasUsed);
        const tx = await web3.eth.getTransaction(receipt.tx);
        const gasPrice = new BN(tx.gasPrice);
        const totalGas = gasPrice.mul(gasUsed);

        return totalGas;
    };

    it('allows transfers', async function () {
        await this.token.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
      
        const ownerBalance = await web3.eth.getBalance(owner);
        const winnerBalance = await web3.eth.getBalance(winner);
        const transfereeBalance = await web3.eth.getBalance(transferee);
      
        const price = (await this.token.price(0));
        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000'));
        expect(price.toString()).to.equal(expectedPrice.toString());
        
        const receipt = await this.token.buy(transferee, 0, { from: transferee, value: price });
        const gas = await getTransactionCost(receipt);

        const newPrice = (await this.token.price(0));
        const newExpectedPrice = initialPrice.mul(new BN('11000')).mul(new BN('11000')).div(new BN('100000000'));
        expect(newPrice.toString()).to.equal(newExpectedPrice.toString());
        
        const newOwnerBalance = await web3.eth.getBalance(owner);
        const newWinnerBalance = await web3.eth.getBalance(winner);
        const newTransfereeBalance = await web3.eth.getBalance(transferee);
        const expectedRoyalty = expectedPrice.mul(new BN('500')).div(new BN('10000'));
        
        const newExpectedOwnerBalance = new BN(ownerBalance).add(expectedRoyalty);
        expect(newOwnerBalance.toString()).to.equal(newExpectedOwnerBalance.toString());
        
        const newExpectedWinnerBalance = new BN(winnerBalance).add(expectedPrice).sub(expectedRoyalty);
        expect(newWinnerBalance.toString()).to.equal(newExpectedWinnerBalance.toString());

        const newExpectedTransfereeBalance = new BN(transfereeBalance).sub(expectedPrice).sub(gas);
        expect(newTransfereeBalance.toString()).to.equal(newExpectedTransfereeBalance.toString());        
    });
    
/*
    it('non minter cannot mint', async function () {
        await expectRevert(
            this.token.mint(winner, solution, tokenURI, { from: other, value: initialPrice }), 
            'EthordleToken: must have minter role to mint'
        );
    });
    */
});
