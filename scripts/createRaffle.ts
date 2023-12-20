import { ethers } from 'hardhat'
const RAFFLE_ADDRESS = '0xc2A791CdE67Ab6BE98d7f0aD890BD39d08D1563e'
const TOKEN_ADDRESS = '0xF5CC29a156bF5617987bC5d468A632C5bB5b41eC'
const TOKEN_ID = 4

async function main() {
  const raffle = await ethers.getContractAt('NftRaffle', RAFFLE_ADDRESS)
  const mockNft = await ethers.getContractAt('MockNft', TOKEN_ADDRESS)

//   const mintTx = await mockNft.safeMint(100)
//   await mintTx.wait()

  const approveTx = await mockNft.setApprovalForAll(RAFFLE_ADDRESS, true)
  await approveTx.wait()

  console.log('approved')

  const createTx = await raffle.createRaffle(
    TOKEN_ID,
    TOKEN_ADDRESS,
    ethers.parseEther('0.001'),
    3
  )
  await createTx.wait()

  const raffleId = await raffle.raffleCount()

  console.log('raffle created: ', raffleId.toString())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
