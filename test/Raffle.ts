import {
    time,
    loadFixture
  } from '@nomicfoundation/hardhat-toolbox/network-helpers'
  import { expect } from 'chai'
  import { ethers } from 'hardhat'
  const { parseEther } = ethers
  describe('NftRaffle', function () {
    async function deployNftRaffleFixture() {
      // Deploy the mock NFT and Entropy contracts
      const MockNft = await ethers.getContractFactory('MockNft')
      const mockNFT = await MockNft.deploy()
      const EntropyMock = await ethers.getContractFactory('EntropyMock')
      const entropyMock = await EntropyMock.deploy()
  
      // Deploy the NftRaffle contract
      const NftRaffle = await ethers.getContractFactory('NftRaffle')
      const nftRaffle = await NftRaffle.deploy(
        await entropyMock.getAddress(),
        ethers.ZeroAddress
      )
  
      const [owner, addr1, addr2, addr3] = await ethers.getSigners()
  
      return { nftRaffle, entropyMock, mockNFT, owner, addr1, addr2, addr3 }
    }
  
    describe('Raffle Creation', function () {
      it('Should create a raffle with correct parameters', async function () {
        const { nftRaffle, mockNFT, owner } = await loadFixture(
          deployNftRaffleFixture
        )
        const tokenId = 1
        const ticketPrice = parseEther('0.1')
        const maxTickets = 3
  
        await mockNFT.safeMint(100)
        await mockNFT.approve(await nftRaffle.getAddress(), tokenId)
  
        await expect(
          nftRaffle.createRaffle(
            tokenId,
            await mockNFT.getAddress(),
            ticketPrice,
            maxTickets
          )
        )
          .to.emit(nftRaffle, 'RaffleCreated')
          .withArgs(1, tokenId, await mockNFT.getAddress(), ticketPrice, maxTickets)
      })
    })
  
    describe('Ticket Purchase', function () {
      it('Should allow purchasing a ticket', async function () {
        const { nftRaffle, mockNFT, owner, addr1 } = await loadFixture(
          deployNftRaffleFixture
        )
        const tokenId = 1
        const ticketPrice = parseEther('0.1')
        const maxTickets = 3
  
        await mockNFT.safeMint(100)
        await mockNFT.approve(await nftRaffle.getAddress(), tokenId)
        await nftRaffle.createRaffle(
          tokenId,
          await mockNFT.getAddress(),
          ticketPrice,
          maxTickets
        )
  
        await expect(
          nftRaffle.connect(addr1).purchaseTicket(1, { value: ticketPrice })
        )
          .to.emit(nftRaffle, 'TicketPurchased')
          .withArgs(1, tokenId, await mockNFT.getAddress(), await addr1.getAddress())
      })
    })
  
    describe('Raffle Closure', function () {
      it('Should close the raffle correctly', async function () {
        const { nftRaffle, mockNFT, owner, entropyMock, addr1, addr2, addr3 } = await loadFixture(
          deployNftRaffleFixture
        )
        const tokenId = 1
        const ticketPrice = parseEther('0.1')
        const maxTickets = 3
  
        await mockNFT.safeMint(100)
        await mockNFT.approve(await nftRaffle.getAddress(), tokenId)
        await nftRaffle.createRaffle(
          tokenId,
          await mockNFT.getAddress(),
          ticketPrice,
          maxTickets
        )
  
        await nftRaffle.connect(addr1).purchaseTicket(1, { value: ticketPrice })
        await nftRaffle.connect(addr2).purchaseTicket(1, { value: ticketPrice })
        await nftRaffle.connect(addr3).purchaseTicket(1, { value: ticketPrice })
  
        const userCommitment = ethers.randomBytes(32)
        const fee = await entropyMock.getFee(ethers.ZeroAddress)
  
        await expect(
          nftRaffle.closeRaffle(1, userCommitment, { value: fee })
        ).to.emit(nftRaffle, 'RaffleClosed')
      })
    })
  
    describe('Raffle Drawing', function () {
      it('Should draw the raffle and transfer NFT to winner', async function () {
        const { nftRaffle, mockNFT, owner, entropyMock, addr1, addr2, addr3 } =
          await loadFixture(deployNftRaffleFixture)
        const tokenId = 1
        const ticketPrice = parseEther('0.1')
        const maxTickets = 3
  
        await mockNFT.safeMint(100)
        await mockNFT.approve(await nftRaffle.getAddress(), tokenId)
        await nftRaffle.createRaffle(
          tokenId,
          await mockNFT.getAddress(),
          ticketPrice,
          maxTickets
        )
  
        await nftRaffle.connect(addr1).purchaseTicket(1, { value: ticketPrice })
        await nftRaffle.connect(addr2).purchaseTicket(1, { value: ticketPrice })
        await nftRaffle.connect(addr3).purchaseTicket(1, { value: ticketPrice })
  
        const userCommitment = ethers.randomBytes(32)
        const fee = await entropyMock.getFee(ethers.ZeroAddress)
  
        await nftRaffle.closeRaffle(1, userCommitment, { value: fee })
  
        // Simulate entropy response
        const sequenceNumber = 1 // Assume this is the sequence number returned
        const userRandom = ethers.randomBytes(32)
        const providerRandom = ethers.randomBytes(32)
  
        await expect(
          nftRaffle.drawRaffle(1, sequenceNumber, userRandom, providerRandom)
        ).to.emit(nftRaffle, 'RaffleDrawn')
  
        // Check NFT transfer
        const winner = await mockNFT.ownerOf(tokenId)
        expect(winner).to.equal(await addr1.getAddress()) 
        expect(await mockNFT.ownerOf(tokenId)).to.equal(await addr1.getAddress())
      })
    })
  })
  