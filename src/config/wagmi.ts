import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http, injected } from "wagmi";
import { mainnet,sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const useWalletConnect = projectId.length > 0 && projectId !== "YOUR_PROJECT_ID";

const rpcMainnet = process.env.NEXT_PUBLIC_RPC_MAINNET;
const rpcSepolia = process.env.NEXT_PUBLIC_RPC_SEPOLIA;

export const config = useWalletConnect
  ? getDefaultConfig({
      appName: "Ether Prime Stake",
      projectId,
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(rpcMainnet),
        // [sepolia.id]: http(rpcSepolia),
      },
      ssr: true,
    })
  : createConfig({
      chains: [mainnet],
      connectors: [injected()],
      transports: {
        [mainnet.id]: http(rpcMainnet),
        // [sepolia.id]: http(rpcSepolia),
      },
      ssr: true,
    });
