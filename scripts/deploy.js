// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = hre.ethers.utils.parseUnits('10', 'ether');
  const MAX_SUPPLY = 25
  const NFT_MINT_DATE = (Date.now() + 60000).toString().slice(0, 10);
  const IPFS_METADATA_URI = 'ipfs://bafybeidpuzq54zqnmgq5lsbegxwrwkgrt72545l3pyj6c4y3qsprfamu6u/'

  // Deploy NFT
  const NFT = await hre.ethers.getContractFactory('NFT')
  let nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, NFT_MINT_DATE, IPFS_METADATA_URI)

  await nft.deployed()
  console.log(`NFT deployed to: ${nft.address}\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
