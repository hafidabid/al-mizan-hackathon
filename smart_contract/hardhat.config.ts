import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    liskSepolia: {
      type: "http",
      chainType: "l1",
      chainId: 4202,
      url: configVariable("LISK_SEPOLIA_RPC_URL"),
      accounts: [configVariable("LISK_SEPOLIA_PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      apiKey: "empty",
    },
  },
  chainDescriptors: {
    4202: {
      name: "Lisk Sepolia",
      chainType: "l1",
      blockExplorers: {
        etherscan: {
          name: "Lisk Sepolia",
          url: "https://sepolia-blockscout.lisk.com",
          apiUrl: "https://sepolia-blockscout.lisk.com/api",
        },
      },
    },
  },
});
