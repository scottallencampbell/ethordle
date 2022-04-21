const { expect } = require('chai');
const { expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const EthordleToken = artifacts.require("./EthordleToken.sol");
const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const { BADNAME } = require('dns');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

chai.use(bnChai(BN));


contract('EthordleToken', function ([owner, winner, other, transferee]) {

    const name = 'Ethordle Token';
    const symbol = 'EthordleToken';
    const initialPrice = web3.utils.toWei(new BN(1), 'ether'); 
    const royaltyRate = '500';
    const priceEscalationRate = '11000';
    const solution = 'STARE';
    const otherSolutions = ['CHOMP', 'SPORK', 'BLURT'];
    const tokenURI = 'http://ethordle.com';
    const otherTokenURIs = ['http://ethordle.com/1', 'http://ethordle.com/2', 'http://ethordle.com/3'];
    
    const getTransactionCost = async (receipt) => {
        const gasUsed = new BN(receipt.receipt.gasUsed);
        const tx = await web3.eth.getTransaction(receipt.tx);
        const gasPrice = new BN(tx.gasPrice);
        const totalGas = gasPrice.mul(gasUsed);

        return totalGas;
    };

    beforeEach(async function () {
        this.contract = await EthordleToken.new(name, symbol, initialPrice, royaltyRate, priceEscalationRate, { from: owner });
    });
/*
    it('has metadata', async function () {
        expect(await this.contract.name()).to.equal(name);
        expect(await this.contract.symbol()).to.equal(symbol);
        expect((await this.contract.initialPrice()).toString()).to.equal(initialPrice.toString());
        expect((await this.contract.royaltyRate()).toString()).to.equal(royaltyRate);
    });

    it('ignores disallowed methods', async function () {
        const receipt = await this.contract.mint(winner, solution, tokenURI, { from: owner, value: initialPrice });
        const token = await this.contract.tokenById(0);
        const price = token.price;

        await expectRevert(
            this.contract.transferFrom(winner, transferee, 0, { from: winner, value: price }), 
            'revert' // why not 'Method may only be called by the owner'?
        );

        await expectRevert(
            this.contract.safeTransferFrom(winner, transferee, 0, { from: winner, value: price }), 
            'revert'
        );

        await expectRevert(
            this.contract.safeTransferFrom(winner, transferee, 0, new Uint8Array(16), { from: winner, value: price }), 
            'revert'
        );
    });

    it('minter can mint token', async function () {
        const receipt = await this.contract.mint(winner, solution, tokenURI, { from: owner, value: initialPrice });
        const token = await this.contract.tokenById(0);
        
        expect(token.id.toString()).is.a.bignumber.that.equals(new BN(0));
        expect(token.owner).to.equal(winner);
        expect(token.url).to.equal(tokenURI);
        expect(token.solution).to.equal(solution);
        expect(token.transactionCount.toString()).is.a.bignumber.that.equals(new BN(1));
        expect(await this.contract.tokenCount()).is.a.bignumber.that.equals(new BN(1));
        
        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000')).toString();
        expect(token.price.toString()).to.equal(expectedPrice);
        
        const tokens = await this.contract.tokensOfOwner(winner);
        expect(tokens.length).to.equal(1);
        expect(tokens[0].id).is.a.bignumber.that.equals(new BN(0));

        const allTokens = await this.contract.tokens();
        expect(allTokens.length).to.equal(1);
        expect(allTokens[0].id).is.a.bignumber.that.equals(new BN(0));

        expectEvent(receipt, 'Transfer', { from: constants.ZERO_ADDRESS, to: winner, tokenId: '0' });
    });
 
    it('normal account can mint token', async function () {
        const receipt = await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
        const token = await this.contract.tokenById(0);
        
        expect(token.id.toString()).is.a.bignumber.that.equals(new BN(0));
        expect(token.owner).to.equal(winner);
        expect(token.url).to.equal(tokenURI);
        expect(token.solution).to.equal(solution);

        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000')).toString();
        expect(token.price.toString()).to.equal(expectedPrice);
        
        const tokens = await this.contract.tokensOfOwner(winner);
        expect(tokens.length).to.equal(1);
        expect(tokens[0].id).is.a.bignumber.that.equals(new BN(0));

        const allTokens = await this.contract.tokens();
        expect(allTokens.length).to.equal(1);
        expect(allTokens[0].id).is.a.bignumber.that.equals(new BN(0));

        expectEvent(receipt, 'Transfer', { from: constants.ZERO_ADDRESS, to: winner, tokenId: '0' });
    });

    it('normal account can mint multiple tokens', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
        await this.contract.mint(winner, otherSolutions[0], otherTokenURIs[0], { from: winner, value: initialPrice });
        await this.contract.mint(winner, otherSolutions[1], otherTokenURIs[1], { from: winner, value: initialPrice });
        await this.contract.mint(winner, otherSolutions[2], otherTokenURIs[2], { from: winner, value: initialPrice });

        const token = await this.contract.tokenById(0);
        const token2 = await this.contract.tokenById(1);
        const token3 = await this.contract.tokenById(2);
        const token4 = await this.contract.tokenById(3);
        
        expect(token.id.toString()).is.a.bignumber.that.equals(new BN(0));
        expect(token2.id.toString()).is.a.bignumber.that.equals(new BN(1));
        expect(token3.id.toString()).is.a.bignumber.that.equals(new BN(2));
        expect(token4.id.toString()).is.a.bignumber.that.equals(new BN(3));

        expect(token.owner).to.equal(winner);
        expect(token2.owner).to.equal(winner);
        expect(token3.owner).to.equal(winner);
        expect(token4.owner).to.equal(winner);
        // todo simplify all this
        expect(token.url).to.equal(tokenURI);
        expect(token2.url).to.equal(otherTokenURIs[0]);
        expect(token3.url).to.equal(otherTokenURIs[1]);
        expect(token4.url).to.equal(otherTokenURIs[2]);
        
        expect(token.solution).to.equal(solution);
        expect(token2.solution).to.equal(otherSolutions[0]);
        expect(token3.solution).to.equal(otherSolutions[1]);
        expect(token4.solution).to.equal(otherSolutions[2]);
        
        expect(await this.contract.tokenCount()).is.a.bignumber.that.equals(new BN(4));

        const tokens = await this.contract.tokensOfOwner(winner);

        expect(tokens.length).to.equal(4);
        expect(tokens[0].id).is.a.bignumber.that.equals(new BN(0));
        expect(tokens[1].id).is.a.bignumber.that.equals(new BN(1));
        expect(tokens[2].id).is.a.bignumber.that.equals(new BN(2));
        expect(tokens[3].id).is.a.bignumber.that.equals(new BN(3));
    });

    it('can determine solution uniqueness', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: owner, value: initialPrice });

        expect(await this.contract.isSolutionUnique(solution)).to.equal(false);
        expect(await this.contract.isSolutionUnique(otherSolutions[0])).to.equal(true);
    });

    it('minted solution cannot be reused', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });

        await expectRevert(
            this.contract.mint(other, solution, otherTokenURIs[0], { from: other, value: initialPrice }), 
            'A token has already been minted with this solution'
        );
    });

    it('minted token URI cannot be reused', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });

        await expectRevert(
            this.contract.mint(other, otherSolutions[0], tokenURI, { from: other, value: initialPrice }), 
            'A token has already been minted with this URI'
        );
    });

    it('insufficient value sent is rejected', async function () {
        await expectRevert(
            this.contract.mint(winner, solution, tokenURI, { from: owner, value: initialPrice.sub(new BN('1000')) }), 
            'Insufficient ether sent with this transaction'
        );
    });

    it('transfers value to owner', async function () {
        const ownerBalance = await web3.eth.getBalance(owner);
        const winnerBalance = await web3.eth.getBalance(winner);
       
        const receipt0 = await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
        const receipt1 = await this.contract.mint(winner, otherSolutions[0], otherTokenURIs[0], { from: winner, value: initialPrice });
        const receipt2 = await this.contract.mint(winner, otherSolutions[1], otherTokenURIs[1], { from: winner, value: initialPrice });
        const receipt3 = await this.contract.mint(winner, otherSolutions[2], otherTokenURIs[2], { from: winner, value: initialPrice });

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
*/
    it('allows transfers', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
      
        const ownerBalance = await web3.eth.getBalance(owner);
        const winnerBalance = await web3.eth.getBalance(winner);
        const transfereeBalance = await web3.eth.getBalance(transferee);
        
        const token = await this.contract.tokenById(0);
        console.log('Token price after: ' + initialPrice);
        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000'));
        expect(token.price.toString()).to.equal(expectedPrice.toString());
        expect(BN(token.transactionCount)).to.be.a.bignumber.that.equals(BN(1));
        
        console.log('Token price after: ' + token.price);
        const receipt = await this.contract.buy(transferee, 0, { from: transferee, value: token.price });
        const gas = await getTransactionCost(receipt);

        const newToken = await this.contract.tokenById(0);
        const newExpectedPrice = initialPrice.mul(new BN('11000')).mul(new BN('11000')).div(new BN('100000000'));
        expect(newToken.price.toString()).to.equal(newExpectedPrice.toString());
        expect(BN(newToken.transactionCount)).to.be.a.bignumber.that.equals(BN(2));
        
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
    it('rounds high-precision values down during one-off transaction', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
        const token = await this.contract.tokenById(0);
        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000'));
        expect(token.price.toString()).to.equal(expectedPrice.toString());
        
        await this.contract.buy(transferee, 0, { from: transferee, value: new BN('1234567890123456789') });
        // todo remove
        await this.contract.buy(winner, 0, { from: winner, value: new BN('1534567890123456789') });
        await this.contract.buy(other, 0, { from: other, value: new BN('1834567890123456789') });

        const newToken = await this.contract.tokenById(0);
        const newExpectedPrice = new BN('1358000000000000000');
        expect(newToken.price.toString()).to.equal(newExpectedPrice.toString());
    });

    it('rounds high-precision values down as transfers occur', async function () {
        await this.contract.mint(winner, solution, tokenURI, { from: winner, value: initialPrice });
      
        let token = await this.contract.tokenById(0);
        const expectedPrice = initialPrice.mul(new BN('11000')).div(new BN('10000'));
        expect(token.price.toString()).to.equal(expectedPrice.toString());
        
        for (let i = 0; i < 3; i++) {
            await this.contract.buy(transferee, 0, { from: transferee, value: token.price });
            token = await this.contract.tokenById(0);
           
            await this.contract.buy(other, 0, { from: other, value: token.price });
            token = await this.contract.tokenById(0);
            
            await this.contract.buy(winner, 0, { from: winner, value: token.price });
            token = await this.contract.tokenById(0);        
        }

        const newExpectedPrice = new BN('2591000000000000000');
        expect(token.price.toString()).to.equal(newExpectedPrice.toString());
    });  
    */ 
});
