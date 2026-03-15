# Ether Prime Stake — Next.js dApp

ETH2.0的 Next.js 前端 dApp，提供 ETH 流动性质押界面，并集成钱包连接（RainbowKit + Wagmi）。

## 技术栈

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Wagmi** + **Viem** — 以太坊交互
- **RainbowKit** — 钱包连接 UI

## 开发

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 钱包连接（WalletConnect）

如需在移动端或使用 WalletConnect 扫码连接，请：

1. 打开 [WalletConnect Cloud](https://cloud.walletconnect.com/) 创建项目并获取 **Project ID**。
2. 在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的_project_id
```

3. 未配置时仍可使用 MetaMask 等注入式钱包连接。

## 构建与部署

```bash
npm run build
npm start
```

## 项目结构

- `src/app/` — 布局、全局样式、Providers
- `src/components/` — Header、Hero、StakeCard、RightColumn、BottomRow、Footer、StakePage
- `src/config/wagmi.ts` — Wagmi / RainbowKit 链与配置

界面逻辑与样式已从原 HTML 迁移，APY 动效、质押输入与预估 epETH、协议健康与活动流等均保留。
