import { ethers } from 'hardhat'
const RAFFLE_ADDRESS = '0x321443637A0a608123E557989E99c1DbB27e774c'
const TOKEN_ADDRESS = '0xF9ac39e588486f3B17222eBD59F7833A0e95b727'
const TOKEN_ID = 1

async function main() {
  const raffle = await ethers.getContractAt('NftRaffle', RAFFLE_ADDRESS)
  const mockNft = await ethers.getContractAt('MockNft', TOKEN_ADDRESS)

  const mintTx = await mockNft.safeMint(100)
  await mintTx.wait()

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
