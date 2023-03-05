import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    fantom_opera_localhost: {
      url: `http://localhost:18545`,
      accounts: [
        "ee60ae4a9ef7093f654fbee5f82a988d8aaed375972b199317ad2a6612bfc80f", // f6d98c56af286bd00aac313a5bf0c0f2f3c7d002
        "193797fc9173c4449517c27e098ffc5e4b72d661a87d88e7c2134365ab6bee9e", // 2df3470e28c220f9f73a9d3e30f4ec5d97629456
        "d58a399d16035036f70830bb25dfe6312f578f8895708e11c53b563f526734ea", // fd0b8b95dfc4ab760e1018a04c2e98acb91d3058
        "605d59030c374d54abca05631a1d231b7ad4cce6821a9e7270c236cbe61d23e3"  // e6dadd4b32abbbc8b47a8d0e4bbed17e45608ed0
      ]
    },
    fantom_testnet: {
      url: `https://rpc.ankr.com/fantom_testnet`,
      accounts: [
        "ee60ae4a9ef7093f654fbee5f82a988d8aaed375972b199317ad2a6612bfc80f", // f6d98c56af286bd00aac313a5bf0c0f2f3c7d002
      ]
    }
  },
  etherscan: {
    apiKey: "QQQS6AGRTYT33AH74KQMMKTIT1KM9SJXZ3",
    customChains: [
      {
        network: "ftmTestnet",
        chainId: 4002,
        urls: {
          apiURL: "https://api-testnet.ftmscan.com/api/",
          browserURL: "https://testnet.ftmscan.com/"
        }
      }
    ]
  }
};

export default config;
