import { ethers } from "hardhat";
const ENTROPY_ADDRESS = '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a'
const ENTROPY_PROVIDER = '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344'

async function main() {
  const Raffle = await ethers.getContractFactory("NftRaffle");
  const raffle = await Raffle.deploy(ENTROPY_ADDRESS, ENTROPY_PROVIDER)
  const raffleAddress = await raffle.getAddress()
  
  console.log('raffle: ', raffleAddress)

  const MockNft = await ethers.getContractFactory('MockNft')
  const mockNFT = await MockNft.deploy()

  console.log('nft: ', await mockNFT.getAddress())

  await mockNFT.safeMint(100)
  
  console.log('minted')

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
