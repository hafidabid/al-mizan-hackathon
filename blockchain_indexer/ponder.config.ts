import { createConfig } from "ponder";

import { liskSepolia } from "viem/chains";
import { mockStableCoin } from "./abis/mockStableCoin";
import { wakafcontract } from "./abis/wakaf";

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1!,
    },
    liskSepolia: {
      ...liskSepolia,
      rpc: process.env.PONDER_RPC_URL_42!,
    },
  },
  contracts: {
    MocKIDR: {
      chain: "liskSepolia",
      abi: mockStableCoin,
      address: "0xBFeA7EF2e068e017Ae1Ac39479E7d12A74d742F5",
      startBlock: 29345837,
    },
    Wakaf: {
      chain: "liskSepolia",
      abi: wakafcontract,
      address: "0x1066756013EF4E42c9ff464a28567f78FA679d99",
      startBlock: 29345837,
    },
  },
});
