import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http, injected } from "wagmi";
import { mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const useWalletConnect = projectId.length > 0 && projectId !== "YOUR_PROJECT_ID";

/**
 * 当未配置有效的 WalletConnect projectId 时，仅使用「注入式钱包」(如 MetaMask)，
 * 连接请求会直接发到浏览器扩展，避免「请在扩展中确认」但扩展无弹窗的问题。
 * 在 https://cloud.walletconnect.com/ 申请 projectId 并写入 .env.local 后可启用完整 RainbowKit（含扫码等）。
 */
export const config = useWalletConnect
  ? getDefaultConfig({
      appName: "Ether Prime Stake",
      projectId,
      chains: [mainnet],
      ssr: true,
    })
  : createConfig({
      chains: [mainnet],
      connectors: [injected()],
      transports: {
        [mainnet.id]: http(),
      },
      ssr: true,
    });
