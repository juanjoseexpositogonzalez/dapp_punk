const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ether = tokens

describe('NFT', () => {
    const NAME = 'Dapp Punks';
    const SYMBOL = 'DP';
    const COST = ether(10);
    const MAX_SUPPLY = 25;
    const BASE_URI = 'ipfs://bafybeidpuzq54zqnmgq5lsbegxwrwkgrt72545l3pyj6c4y3qsprfamu6u/';

    let nft, deployer, minter;

    beforeEach(async () => {
        let accounts = await ethers.getSigners();
        deployer = accounts[0];
        minter = accounts[1];
    })

    describe('Deployment', () => {
        const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10); // 2 minutes from now

        beforeEach(async () => {
            const NFT = await ethers.getContractFactory('NFT')
            nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);
        });

        it('has correct name', async () => {
            expect(await nft.name()).to.equal(NAME);
        });

        it('has correct symbol', async () => {
            expect(await nft.symbol()).to.equal(SYMBOL);
        });

        it('returns the cost to mint', async () => {
            expect(await nft.cost()).to.equal(COST);
        });

        it('returns the maximum total supply', async () => {
            expect(await nft.maxSupply()).to.equal(MAX_SUPPLY);
        });

        it('returns the allowed mintim time', async () => {
            expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON);
        });

        it('returns the base URI', async () => {
            expect(await nft.baseURI()).to.equal(BASE_URI);
        });

        it('returns the owner', async () => {
            expect(await nft.owner()).to.equal(deployer.address);
        });
    })

    describe('Displaying NFTs', () => {
        let transaction, result
        const TOTAL_MINT = 1;
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0, 10); // Now

        describe('Success', () => {

            beforeEach(async () => {
                const NFT = await ethers.getContractFactory('NFT')
                nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);

                transaction = await nft.connect(minter).mint(TOTAL_MINT, { value: COST });
                result = await transaction.wait();
            });

            it('returns the address of the minter', async () => {
                expect(await nft.ownerOf(1)).to.equal(minter.address);
            });

            it('returns total number of tokens the minter owns', async () => {
                expect(await nft.balanceOf(minter.address)).to.equal(1);
            });

            it('returns IPFS URI', async () => {
                // EG: 'pfs://bafybeidpuzq54zqnmgq5lsbegxwrwkgrt72545l3pyj6c4y3qsprfamu6u/1.json'
                // Uncomment this line to see example
                // console.log(await nft.tokenURI(1));
                expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
            });

            it('updates the total supply', async () => {
                expect(await nft.totalSupply()).to.equal(TOTAL_MINT);
            });

            it('updates the contract ether balance', async () => {
                expect(await ethers.provider.getBalance(nft.address)).to.equal(COST);
            });

            it('emits Mint event', async () => {
                await expect(transaction).to.emit(nft, 'Mint').withArgs(1, minter.address);
            });
        });

        describe('Failure', () => {

            it('rejects insufficient payment', async () => {
                const NFT = await ethers.getContractFactory('NFT')
                nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);

                await expect(nft.connect(minter).mint(TOTAL_MINT, { value: ether(1) })).to.be.reverted;
            });

            it('rejects minting before allowed time', async () => {
                const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10); // Now
                const NFT = await ethers.getContractFactory('NFT')
                nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);

                await expect(nft.connect(minter).mint(TOTAL_MINT, { value: COST })).to.be.reverted;
            });

            it('requires at least 1 nft to be minted', async () => {
                const NFT = await ethers.getContractFactory('NFT')
                nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);

                await expect(nft.connect(minter).mint(0, { value: ether(1) })).to.be.reverted;
            });

            it('does not allow more NFTs to be minted than max amount', async () => {
                const NFT = await ethers.getContractFactory('NFT')
                nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);

                await expect(nft.connect(minter).mint(100, { value: ether(1) })).to.be.reverted;
            });

            it('does not return URIs for invalid tokens', async () => {
                const NFT = await ethers.getContractFactory('NFT')
                nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);
                await nft.connect(minter).mint(TOTAL_MINT, { value: COST })

                await expect(nft.tokenURI(2)).to.be.reverted;
            });

        });
    });

    describe('Minting', () => {
        let transaction, result
        const TOTAL_MINT = 3;
        const TOTAL_COST = ether(30);
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0, 10); // Now



        beforeEach(async () => {
            const NFT = await ethers.getContractFactory('NFT')
            nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI);

            transaction = await nft.connect(minter).mint(TOTAL_MINT, { value: TOTAL_COST });
            result = await transaction.wait();
        });

        it('returns all NFTS for a given owner', async () => {
            let tokenIds = await nft.walletOfOwner(minter.address);
            // Uncomment this line to see the return value
            // console.log("owner wallet", tokenIds);
            expect(tokenIds.length).to.equal(TOTAL_MINT);
            expect(tokenIds[0].toString()).to.equal('1');
            expect(tokenIds[1].toString()).to.equal('2');
            expect(tokenIds[2].toString()).to.equal('3');
        });

    });

})
