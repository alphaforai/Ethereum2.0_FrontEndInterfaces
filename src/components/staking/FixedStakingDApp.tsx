"use client";

import React from "react";
import Link from "next/link";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { type Address } from "viem";
import { fixedStakingA_ContractConfig } from "@/config/fixedStakingA_ContractConfig";
import { mainnet } from "wagmi/chains";
import { useI18n } from "@/i18n/useI18n";

type DepositStruct = {
  owner: Address;
  amount: bigint;
  startTime: bigint;
  poolId: bigint;
  withdrawn: boolean;
};

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const MAX_POOLS = 6; // arbitrary scan range
const MAX_DEPOSITS = 5;
const ZERO = BigInt("0");
const APY_SCALE = BigInt("1000000000000000000"); // 1e18
const APY_HINT = BigInt("1000000000000"); // if apy >= 1e12 assume 1e18-scaled

function formatApy(apy?: bigint) {
  if (!apy) return "—";
  // Heuristic: pools(i).apy might be either raw percentage or 1e18-scaled.
  if (apy >= APY_HINT) {
    const v = Number(apy) / Number(APY_SCALE);
    return `${v.toFixed(2)}%`;
  }
  return `${apy.toString()}%`;
}

function shortAddr(addr?: string) {
  if (!addr) return "--";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function fmtTime(ts: bigint) {
  if (ts === ZERO) return "-";
  const ms = Number(ts) * 1000;
  const d = new Date(ms);
  return d.toLocaleDateString();
}

export function FixedStakingDApp() {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const user = (address ?? ADDRESS_ZERO) as Address;
  const chainId = mainnet.id;
  const { t } = useI18n();

  // Pools (duration + apy)
  const poolContracts = Array.from({ length: MAX_POOLS }, (_, i) => ({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "pools",
    args: [BigInt(i)],
  }));

  const { data: poolsData } = useReadContracts({
    contracts: poolContracts as any,
  });

  const poolsRaw = (poolsData ?? []).map((x: any) => x?.result);
  const pools = poolsRaw
    .map((r: any, idx: number) => ({
      id: BigInt(idx),
      duration: r?.duration as bigint | undefined,
      apy: r?.apy as bigint | undefined,
      exists: r?.exists as boolean | undefined,
    }))
    .filter((p) => p.exists);

  const defaultPoolId = pools.length > 0 ? pools[0].id : ZERO;
  const [selectedPoolId, setSelectedPoolId] = React.useState<bigint>(defaultPoolId);
  React.useEffect(() => {
    setSelectedPoolId(defaultPoolId);
  }, [defaultPoolId]);

  // User deposit ids + deposit structs
  const { data: userDepositCount } = useReadContract({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "getUserDepositCount",
    args: [user],
    query: { enabled: Boolean(address) },
  });

  const depositIdContracts = Array.from({ length: MAX_DEPOSITS }, (_, i) => ({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "userDepositIds",
    args: [user, BigInt(i)],
  }));

  const { data: depositIdsData } = useReadContracts({
    contracts: depositIdContracts as any,
    query: { enabled: Boolean(address) },
  });

  const depositIds = (depositIdsData ?? []).map((x: any) => x?.result as bigint);

  const { data: userDepositsData } = useReadContract({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "getUserDeposits",
    args: [user, ZERO, BigInt(MAX_DEPOSITS)],
    query: { enabled: Boolean(address) },
  });

  const userDeposits = (userDepositsData ?? []) as DepositStruct[];

  // Pending reward per depositId
  const pendingContracts = Array.from({ length: MAX_DEPOSITS }, (_, i) => ({
    ...fixedStakingA_ContractConfig,
    chainId,
    functionName: "pendingReward",
    args: [depositIds?.[i] ?? ZERO],
  }));

  const { data: pendingData } = useReadContracts({
    contracts: pendingContracts as any,
    query: { enabled: Boolean(address) },
  });
  const pendingRewards = (pendingData ?? []).map((x: any) => x?.result as bigint);

  // Global total staked (approx: sum deposits for small range)
  const { data: nextDepositId } = useReadContract({
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
    if (nextDepositId !== undefined && id >= (nextDepositId as bigint)) return acc;
    if (dep.withdrawn) return acc;
    return acc + (dep.amount as bigint);
  }, ZERO);

  // Actions
  const [amount, setAmount] = React.useState("0.1");
  const writeDeposit = useWriteContract();
  const writeWithdraw = useWriteContract();
  const writeCompoundMatured = useWriteContract();

  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  const onDeposit = async () => {
    const value = parseEther(amount || "0");
    if (value <= ZERO || !address) return;
    const hash = await writeDeposit.writeContractAsync({
      ...fixedStakingA_ContractConfig,
      chainId,
      functionName: "deposit",
      args: [selectedPoolId],
      value,
    });
    setTxHash(hash);
  };

  const onWithdraw = async (depositId: bigint) => {
    if (!address) return;
    const hash = await writeWithdraw.writeContractAsync({
      ...fixedStakingA_ContractConfig,
      chainId,
      functionName: "withdraw",
      args: [depositId],
    });
    setTxHash(hash);
  };

  const onCompoundMatured = async (depositId: bigint) => {
    if (!address) return;
    const hash = await writeCompoundMatured.writeContractAsync({
      ...fixedStakingA_ContractConfig,
      chainId,
      functionName: "compoundMatured",
      args: [depositId],
    });
    setTxHash(hash);
  };

  return (
    <>
      <div className="main-grid">
        <div className="stake-card">
          <div className="flex justify-between items-start mb-6">
            <span
              className="text-[13px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {t("fixed.title")}
            </span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link
                href="/"
                className="rounded-[12px] px-3 py-2"
                style={{
                  background: "rgba(29,111,255,0.08)",
                  border: "1px solid rgba(29,111,255,0.18)",
                  color: "var(--blue-bright)",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                ← {t("fixed.backToFlexible")}
              </Link>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-title">
              <span className="panel-title-dot" /> {t("fixed.selectPool")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pools.length === 0 && <div style={{ color: "var(--dim)" }}>No pools found.</div>}
              {pools.map((p) => (
                <button
                  key={p.id.toString()}
                  type="button"
                  onClick={() => setSelectedPoolId(p.id)}
                  className="rounded-[14px] px-3 py-3 text-left transition"
                  style={{
                    border: `1px solid ${
                      selectedPoolId === p.id ? "rgba(0,194,255,0.9)" : "var(--border2)"
                    }`,
                    background:
                      selectedPoolId === p.id
                        ? "linear-gradient(135deg, rgba(29,111,255,0.2), rgba(0,194,255,0.1))"
                        : "rgba(13,31,60,0.2)",
                    color: selectedPoolId === p.id ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 13 }}>Pool #{p.id.toString()}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)" as any, fontSize: 11, marginTop: 4, color: "var(--dim)" }}>
                    Duration: {p.duration ? Number(p.duration) : 0} sec
                  </div>
                  <div style={{ fontWeight: 900, color: "var(--yellow)", marginTop: 6 }}>
                    APY: {formatApy(p.apy)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="token-box" style={{ padding: 16, marginBottom: 14 }}>
            <div>
              <div className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                {t("fixed.depositAmount")}
              </div>
              <input
                className="token-input-val"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--dim)",
                  marginTop: 4,
                  fontFamily: "var(--font-jetbrains-mono)" as any,
                }}
              >
                {t("fixed.selectedPool")}: #{selectedPoolId.toString()}
              </div>
            </div>
            <button
              type="button"
              disabled={!address || isConfirming}
              className="stake-btn"
              style={{ width: 200, padding: 14, opacity: !address ? 0.6 : 1 }}
              onClick={onDeposit}
            >
              {isConfirming ? "⏳ Confirming..." : `⚡ ${t("fixed.deposit")}`}
            </button>
          </div>

          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" /> {t("fixed.yourDeposits")}
            </div>
            {address ? null : (
              <div style={{ color: "var(--dim)", fontSize: 13 }}>
                {t("fixed.connectWalletToView")}
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              {userDeposits.length === 0 && (
                <div style={{ color: "var(--dim)", fontSize: 13 }}>
                  {t("fixed.noDeposits")}
                </div>
              )}

              {userDeposits.slice(0, MAX_DEPOSITS).map((d, idx) => {
                const depositId = depositIds?.[idx] ?? ZERO;
                const pending = pendingRewards?.[idx] ?? ZERO;
                const pool = pools.find((p) => p.id === d.poolId);
                return (
                  <div
                    key={`${depositId}-${idx}`}
                    className="flex justify-between items-start py-3 border-b"
                    style={{ borderColor: "var(--border2)" }}
                  >
                    <div style={{ minWidth: 240 }}>
                      <div style={{ fontWeight: 900, color: "var(--text)" }}>
                        {t("fixed.depositLabel")} #{depositId.toString()}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                        {t("fixed.poolLabel")}: {d.poolId.toString()} ·{" "}
                        {pool?.duration ? `${Number(pool.duration)}s` : ""} ·{" "}
                        {pool?.apy ? "higher APY" : ""}
                      </div>
                      <div style={{ color: "var(--dim)", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" as any, marginTop: 4 }}>
                        {t("fixed.startLabel")}: {fmtTime(d.startTime)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, color: "var(--cyan)" }}>
                        {formatEther(d.amount)} ETH
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--green)",
                          fontWeight: 900,
                          marginTop: 4,
                        }}
                      >
                        {t("fixed.pending")}:{" "}
                        {pending ? `${formatEther(pending)} ETH` : "0"}{" "}
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => onWithdraw(depositId)}
                          disabled={!address || d.withdrawn}
                          className="rounded-[12px] px-3 py-2"
                          style={{
                            background: "rgba(255,184,0,0.06)",
                            border: "1px solid rgba(255,184,0,0.18)",
                            color: "var(--yellow)",
                            fontWeight: 900,
                          }}
                        >
                          ↩ {t("fixed.withdraw")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onCompoundMatured(depositId)}
                          disabled={!address || d.withdrawn}
                          className="rounded-[12px] px-3 py-2"
                          style={{
                            background: "rgba(29,111,255,0.06)",
                            border: "1px solid rgba(29,111,255,0.18)",
                            color: "var(--blue-bright)",
                            fontWeight: 900,
                          }}
                        >
                          🔁 {t("fixed.compound")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" /> {t("fixed.statsTitle")}
            </div>
            <div className="metric">
              <span className="metric-k">{t("fixed.totalApprox")}</span>
              <span className="metric-v blue">{formatEther(fixedTotalApprox)} ETH</span>
            </div>
            <div className="metric">
              <span className="metric-k">{t("fixed.yourBalance")}</span>
              <span className="metric-v">{balanceData ? `${formatEther(balanceData.value)} ETH` : "—"}</span>
            </div>
            <div className="metric">
              <span className="metric-k">{t("fixed.yourDepositsCount")}</span>
              <span className="metric-v green">{userDepositCount ? userDepositCount.toString() : "0"}</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" /> {t("fixed.wantRankingTitle")}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
              View staking ranking computed from recent events.
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
                  textDecoration: "none",
                }}
              >
                🏆 {t("fixed.wantRankingBtn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

