"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseAbiItem, parseEther, type Address } from "viem";
import { formatEther4 } from "@/utils/formatEther4";

import { wagmiContractConfig as flexibleContractConfig } from "@/config/FlexibleStakingB_ContractConfig";
import { fixedStakingA_ContractConfig } from "@/config/fixedStakingA_ContractConfig";
import { mainnet } from "wagmi/chains";
import { useI18n } from "@/i18n/useI18n";

type HistoryItem = {
  kind: "deposit" | "withdraw" | "claim" | "compound";
  amount?: bigint;
  reward?: bigint;
  newAmount?: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const ZERO = BigInt("0");
const HISTORY_WINDOW_BLOCKS = BigInt("5000");

function shortAddr(addr?: string) {
  if (!addr) return "--";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function FlexibleStakingDApp() {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({
    address,
  });
  const { t } = useI18n();

  const user = (address ?? ADDRESS_ZERO) as Address;
  const connectedChainId = useChainId();
  const chainId = connectedChainId ?? mainnet.id;

  const {
    data: totalStaked,
    refetch: refetchTotalStaked,
  } = useReadContract({
    ...flexibleContractConfig,
    chainId,
    functionName: "totalStaked",
  });

  // Fixed staking total approximation (sum deposits in [0..20), ignore withdrawn)
  const { data: fixedNextDepositId } = useReadContract({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "nextDepositId",
  });

  const depositsContracts = Array.from({ length: 20 }, (_, i) => ({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "deposits",
    args: [BigInt(i)],
  }));

  const { data: depositsRangeData } = useReadContracts({
    contracts: depositsContracts as any,
  });
  const depositsRangeResults = (depositsRangeData ?? []).map((x: any) => x?.result);
  const fixedTotalApprox = depositsRangeResults.reduce((acc: bigint, dep: any, i: number) => {
    if (!dep) return acc;
    const id = BigInt(i);
    if (fixedNextDepositId !== undefined && id >= (fixedNextDepositId as bigint)) return acc;
    if (dep.withdrawn) return acc;
    const amountVal = dep.amount as unknown;
    if (amountVal == null) return acc;
    const amount =
      typeof amountVal === "bigint" ? amountVal : BigInt(amountVal as any);
    return acc + amount;
  }, ZERO);

  const {
    data: userInfo,
    refetch: refetchUserInfo,
  } = useReadContract({
    ...flexibleContractConfig,
    chainId,
    functionName: "users",
    args: [user],
    query: { enabled: Boolean(address) },
  });

  const {
    data: pendingReward,
    refetch: refetchPendingReward,
    error: pendingError,
  } = useReadContract({
    ...flexibleContractConfig,
    chainId,
    functionName: "pending",
    args: [user],
    query: { enabled: Boolean(address) },
  });

  // `users(address)` 是 tuple 输出：(amount, rewardDebt)
  // wagmi/viem 在某些情况下会返回数组形式 `[amount, rewardDebt]`，因此这里要同时兼容对象与数组。
  const userStaked = React.useMemo(() => {
    if (!userInfo) return undefined;
    const anyInfo = userInfo as any;
    const amountVal = anyInfo?.amount ?? anyInfo?.[0];
    return typeof amountVal === "bigint" ? amountVal : undefined;
  }, [userInfo]);

  // Actions
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [withdrawAmount, setWithdrawAmount] = useState("0.1");

  const publicClient = usePublicClient({ chainId });

  const depositTx = useWriteContract();
  const withdrawTx = useWriteContract();

  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [txInFlight, setTxInFlight] = React.useState<
    null | "deposit" | "withdraw" | "claim" | "compound"
  >(null);

  // Claim / compound (no args)
  const claimTx = useWriteContract();
  const compoundTx = useWriteContract();

  const loadHistory = React.useCallback(async () => {
    if (!address) return;
    if (!publicClient) return;
    setHistoryLoading(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const fromBlock = latest - HISTORY_WINDOW_BLOCKS;

      const depositEvent = parseAbiItem(
        "event Deposit(address indexed user, uint256 amount)",
      );
      const withdrawEvent = parseAbiItem(
        "event Withdraw(address indexed user, uint256 amount)",
      );
      const claimEvent = parseAbiItem(
        "event Claim(address indexed user, uint256 reward)",
      );
      const compoundedEvent = parseAbiItem(
        "event Compounded(address indexed user, uint256 reward, uint256 newAmount)",
      );

      const [depLogs, witLogs, claLogs, compLogs] = await Promise.all([
        publicClient.getLogs({
          address: flexibleContractConfig.address,
          event: depositEvent,
          fromBlock,
          toBlock: latest,
        }),
        publicClient.getLogs({
          address: flexibleContractConfig.address,
          event: withdrawEvent,
          fromBlock,
          toBlock: latest,
        }),
        publicClient.getLogs({
          address: flexibleContractConfig.address,
          event: claimEvent,
          fromBlock,
          toBlock: latest,
        }),
        publicClient.getLogs({
          address: flexibleContractConfig.address,
          event: compoundedEvent,
          fromBlock,
          toBlock: latest,
        }),
      ]);

      const toHistory = (
        logs: any[],
        kind: HistoryItem["kind"],
      ): HistoryItem[] => {
        return logs
          .filter((l) => l.args?.user?.toLowerCase?.() === address.toLowerCase())
          .map((l) => ({
            kind,
            amount:
              kind === "deposit" || kind === "withdraw"
                ? (l.args.amount as bigint)
                : undefined,
            reward:
              kind === "claim" ? (l.args.reward as bigint) : undefined,
            newAmount:
              kind === "compound" ? (l.args.newAmount as bigint) : undefined,
            txHash: l.transactionHash,
            blockNumber: l.blockNumber,
          }));
      };

      const merged: HistoryItem[] = [
        ...toHistory(depLogs, "deposit"),
        ...toHistory(witLogs, "withdraw"),
        ...toHistory(claLogs, "claim"),
        ...toHistory(compLogs, "compound"),
      ].sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1));

      setHistory(merged.slice(0, 10));
    } finally {
      setHistoryLoading(false);
    }
  }, [address, publicClient]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const [depositHash, setDepositHash] = React.useState<`0x${string}` | null>(
    null,
  );
  const [withdrawHash, setWithdrawHash] = React.useState<`0x${string}` | null>(
    null,
  );

  const { isLoading: isDepositing } = useWaitForTransactionReceipt({
    hash: depositHash ?? undefined,
  });
  const { isLoading: isWithdrawing } = useWaitForTransactionReceipt({
    hash: withdrawHash ?? undefined,
  });

  const onDeposit = async () => {
    if (txInFlight) return;
    const value = parseEther(depositAmount || "0");
    if (value <= ZERO) return;
    setTxInFlight("deposit");
    try {
      const hash = await depositTx.writeContractAsync({
        ...flexibleContractConfig,
        chainId,
        functionName: "deposit",
        value,
      });
      setDepositHash(hash);
      if (!publicClient) return;
      await publicClient.waitForTransactionReceipt({ hash });
      refetchUserInfo();
      refetchPendingReward();
      refetchTotalStaked();
      await loadHistory();
    } finally {
      setTxInFlight(null);
    }
  };

  const onWithdraw = async () => {
    if (txInFlight) return;
    const amount = parseEther(withdrawAmount || "0");
    if (amount <= ZERO) return;
    setTxInFlight("withdraw");
    try {
      const hash = await withdrawTx.writeContractAsync({
        ...flexibleContractConfig,
        chainId,
        functionName: "withdraw",
        args: [amount],
      });
      setWithdrawHash(hash);
      if (!publicClient) return;
      await publicClient.waitForTransactionReceipt({ hash });
      refetchUserInfo();
      refetchPendingReward();
      refetchTotalStaked();
      await loadHistory();
    } finally {
      setTxInFlight(null);
    }
  };

  const onClaim = async () => {
    if (txInFlight) return;
    if (!publicClient) return;
    setTxInFlight("claim");
    try {
      const hash = await claimTx.writeContractAsync({
        ...flexibleContractConfig,
        chainId,
        functionName: "claim",
      });
      setHistoryLoading(true);
      await publicClient.waitForTransactionReceipt({ hash });
      setHistoryLoading(false);
      refetchUserInfo();
      refetchPendingReward();
      refetchTotalStaked();
      await loadHistory();
    } finally {
      setTxInFlight(null);
    }
  };

  const onCompound = async () => {
    if (txInFlight) return;
    if (!publicClient) return;
    setTxInFlight("compound");
    try {
      const hash = await compoundTx.writeContractAsync({
        ...flexibleContractConfig,
        chainId,
        functionName: "compound",
      });
      setHistoryLoading(true);
      await publicClient.waitForTransactionReceipt({ hash });
      setHistoryLoading(false);
      refetchUserInfo();
      refetchPendingReward();
      refetchTotalStaked();
      await loadHistory();
    } finally {
      setTxInFlight(null);
    }
  };

  const appTotal = (totalStaked ?? ZERO) + fixedTotalApprox;
  const tvl = appTotal ? formatEther4(appTotal) : "0.0000";
  const stakedStr = userStaked !== undefined ? formatEther4(userStaked) : "--";
  const pendingStr =
    pendingReward !== undefined ? formatEther4(pendingReward) : pendingError ? "ERR" : "--";

  return (
    <>
      <div className="main-grid">
        <div className="stake-card">
          <div className="card-top flex justify-between items-start mb-6">
            <span
              className="text-[13px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {t("flex.title")}
            </span>
            <span
              className="flex items-center gap-2 font-mono text-[10px] font-semibold rounded-md px-2.5 py-1"
              style={{
                color: "var(--green)",
                background: "rgba(0,229,160,0.08)",
                border: "1px solid rgba(0,229,160,0.18)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--green)" }}
              />
              {t("flex.liquid")}
            </span>
          </div>

          <div className="apy-center" style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{t("flex.yourStaked")}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)" }}>
              {address ? stakedStr : "--"} ETH
              </div>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>
                {t("flex.claimable")}:{" "}
                <span style={{ color: "var(--green)", fontWeight: 700 }}>
                  {address ? pendingStr : "—"}
                </span>{" "}
                ETH
              </div>
            </div>
            <div style={{ width: 1, background: "var(--border2)", alignSelf: "stretch" }} />
            <div style={{ minWidth: 160 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{t("flex.wallet")}</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)" as any, fontSize: 11, color: "var(--dim)", marginTop: 4 }}>
                {address ? shortAddr(address) : "Not connected"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, marginTop: 6 }}>
              {t("flex.ethBalance")}: {balanceData ? formatEther4(balanceData.value) : "—"} ETH
              </div>
            </div>
          </div>

          <div className="token-box" style={{ marginBottom: 14, padding: 16 }}>
            <div>
              <div className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                {t("flex.depositAmount")}
              </div>
              <input
                className="token-input-val"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <button
              type="button"
              onClick={onDeposit}
              disabled={!address || txInFlight !== null}
              className="stake-btn"
              style={{ width: 200, padding: 14, opacity: !address ? 0.6 : 1 }}
            >
              {txInFlight === "deposit"
                ? "⏳ Depositing..."
                : `⚡ ${t("flex.deposit")}`}
            </button>
          </div>

          <div className="token-box" style={{ padding: 16, marginBottom: 14 }}>
            <div>
              <div className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                {t("flex.withdrawAmount")}
              </div>
              <input
                className="token-input-val"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <button
              type="button"
              onClick={onWithdraw}
              disabled={!address || txInFlight !== null}
              className="stake-btn"
              style={{ width: 200, padding: 14, opacity: !address ? 0.6 : 1 }}
            >
              {txInFlight === "withdraw"
                ? "⏳ Withdrawing..."
                : `↩ ${t("flex.withdraw")}`}
            </button>
          </div>

          <div className="flex gap-3" style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={onClaim}
              disabled={!address || txInFlight !== null}
              className="rounded-[14px] px-4 py-3"
              style={{
                background: "rgba(0,229,160,0.08)",
                border: "1px solid rgba(0,229,160,0.18)",
                color: "var(--green)",
                fontWeight: 800,
                flex: 1,
              }}
            >
              💰 {txInFlight === "claim" ? "Claiming..." : t("flex.claim")}
            </button>
            <button
              type="button"
              onClick={onCompound}
              disabled={!address || txInFlight !== null}
              className="rounded-[14px] px-4 py-3"
              style={{
                background: "rgba(29,111,255,0.08)",
                border: "1px solid rgba(29,111,255,0.18)",
                color: "var(--blue-bright)",
                fontWeight: 800,
                flex: 1,
              }}
            >
              🔁 {txInFlight === "compound" ? "Compounding..." : t("flex.compound")}
            </button>
          </div>

          <div className="panel" style={{ marginTop: 10 }}>
            <div className="panel-title">
              <span className="panel-title-dot" /> {t("flex.historyTitle")}
            </div>
            {historyLoading && (
              <div style={{ color: "var(--dim)" }}>{t("flex.historyLoading")}</div>
            )}
            {!historyLoading && history.length === 0 && (
              <div style={{ color: "var(--dim)", fontSize: 13 }}>{t("flex.historyEmpty")}</div>
            )}
            <div style={{ marginTop: 10 }}>
              {history.map((h) => (
                <div
                  key={`${h.txHash}-${h.blockNumber}-${h.kind}`}
                  className="flex justify-between items-center py-2 border-b"
                  style={{ borderColor: "var(--border2)" }}
                >
                  <div style={{ minWidth: 90, color: "var(--muted)", fontWeight: 700 }}>
                    {h.kind}
                  </div>
                  <div style={{ flex: 1, color: "var(--dim)", fontSize: 12, marginLeft: 10 }}>
                    tx: {h.txHash.slice(0, 10)}...
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)" as any, fontSize: 11 }}>
                    {h.amount !== undefined && `amount: ${formatEther4(h.amount)} ETH`}
                    {h.reward !== undefined && `reward: ${formatEther4(h.reward)} ETH`}
                    {h.newAmount !== undefined && `new: ${formatEther4(h.newAmount)} ETH`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" /> Protocol Health
            </div>
            <div className="metric">
              <span className="metric-k">App Total Staked</span>
              <span className="metric-v blue">{tvl} ETH</span>
            </div>
            <div className="metric">
              <span className="metric-k">Contract</span>
              <span className="metric-v">{shortAddr(flexibleContractConfig.address)}</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" /> Next Step
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
              {t("flex.nextTitle")}
            </div>
            <div style={{ marginTop: 14 }}>
              <Link
                href="/fixed"
                className="stake-btn block text-center"
                style={{ textDecoration: "none", padding: 16 }}
              >
                ⚡ {t("flex.nextBtn")}
                <span className="btn-sub">{t("flex.nextBtnSub")}</span>
              </Link>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" /> {t("flex.rankTitle")}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
              Live leaderboard computed from recent on-chain events.
            </div>
            <div style={{ marginTop: 14 }}>
              <Link
                href="/ranking"
                className="rounded-[14px] px-4 py-3 block text-center"
                style={{
                  background: "rgba(29,111,255,0.08)",
                  border: "1px solid rgba(29,111,255,0.18)",
                  color: "var(--blue-bright)",
                  fontWeight: 900,
                }}
              >
                🏆 {t("flex.rankBtn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

