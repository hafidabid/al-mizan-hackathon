import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { liskSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Al-Mizan+",
  projectId: "2cef5e731db321e2b3992f41360c1c1b", // Get one at https://cloud.walletconnect.com
  chains: [liskSepolia],
  ssr: false, // If your dApp uses server-side rendering (SSR)
});
