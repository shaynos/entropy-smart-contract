import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'

import { config } from 'dotenv'
config()

const hardhatConfig: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    pegasus: {
      url: process.env.PEGASUS_PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY!]
    },
    phoenix: {
      url: process.env.PHOENIX_PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
  etherscan: {
    apiKey: {
      pegasus: '12345678',
      phoenix: '12345678',
    },
    customChains: [
      {
        network: 'pegasus',
        chainId: 1891,
        urls: {
          apiURL: 'https://pegasus.lightlink.io/api',
          browserURL: 'https://pegasus.lightlink.io',
        },
      },
      {
        network: 'phoenix',
        chainId: 1890,
        urls: {
          apiURL: 'https://phoenix.lightlink.io/api',
          browserURL: 'https://phoenix.lightlink.io',
        },
      },
    ],
  }

};

export default hardhatConfig;

// npx hardhat verify --network pegasus 0xD8900BE82653e13f0659324AC7a45799fE69AD11 0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a 0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344