"use client";

import React from "react";
import Link from "next/link";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { formatEther4 } from "@/utils/formatEther4";
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
const MAX_POOLS = 20; // scan range for pools(i)
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

function formatDurationHours(duration?: bigint) {
  if (!duration) return "—";
  // `pools(i).duration` is uint256 seconds
  const hours = Number(duration) / 3600;
  const s = hours.toFixed(2);
  return s.replace(/\.?0+$/, "");
}

export function FixedStakingDApp() {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const user = (address ?? ADDRESS_ZERO) as Address;
  const connectedChainId = useChainId();
  const chainId = connectedChainId ?? mainnet.id;
  const { t } = useI18n();

  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, []);

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
    .map((r: any, idx: number) => {
      // `pools(i)` likely returns a tuple: (duration, apy, exists)
      // Depending on wagmi/viem version, it can be returned as object or array.
      const duration = (r?.duration ?? r?.[0]) as bigint | undefined;
      const apy = (r?.apy ?? r?.[1]) as bigint | undefined;
      const existsRaw = r?.exists ?? r?.[2];
      const exists =
        typeof existsRaw === "boolean" ? existsRaw : existsRaw != null ? Boolean(existsRaw) : false;

      return {
        id: BigInt(idx),
        duration,
        apy,
        exists,
      };
    })
    .filter((p) => p.exists === true);

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
    const amountVal = dep.amount as unknown;
    if (amountVal == null) return acc;
    const amount = typeof amountVal === "bigint" ? amountVal : BigInt(amountVal as any);
    return acc + amount;
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
    if (isConfirming || txHash) return;
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
    if (isConfirming || txHash) return;
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
                    Duration: {formatDurationHours(p.duration)} hrs
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

                const durationSec = pool?.duration;
                let progressPct: number | null = null;
                if (durationSec && durationSec > ZERO && d.startTime) {
                  const startMs = Number(d.startTime) * 1000;
                  const durMs = Number(durationSec) * 1000;
                  const elapsed = nowMs - startMs;
                  const raw = durMs > 0 ? elapsed / durMs : 0;
                  const clamped = Math.max(0, Math.min(1, raw));
                  progressPct = Math.round(clamped * 100);
                }

                return (
                  <div
                    key={`${depositId}-${idx}`}
                    className="fixed-deposit-row flex justify-between items-start py-3 border-b"
                    style={{ borderColor: "var(--border2)" }}
                  >
                    <div className="fixed-deposit-left" style={{ minWidth: 240 }}>
                      <div style={{ fontWeight: 900, color: "var(--text)" }}>
                        {t("fixed.depositLabel")} #{depositId.toString()}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                        {t("fixed.poolLabel")}: {d.poolId.toString()} ·{" "}
                        {pool?.duration ? `${formatDurationHours(pool.duration)} hrs` : ""} ·{" "}
                        {pool?.apy ? "higher APY" : ""}
                      </div>
                      <div style={{ color: "var(--dim)", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" as any, marginTop: 4 }}>
                        {t("fixed.startLabel")}: {fmtTime(d.startTime)}
                      </div>

                      {progressPct !== null && (
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              height: 10,
                              background: "rgba(29,111,255,0.10)",
                              border: "1px solid rgba(29,111,255,0.22)",
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${progressPct}%`,
                                height: "100%",
                                background:
                                  "linear-gradient(90deg, rgba(29,111,255,1), rgba(0,194,255,1))",
                                boxShadow: "0 0 22px rgba(0,194,255,0.25)",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              color: "var(--dim)",
                              fontFamily: "var(--font-jetbrains-mono)" as any,
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <span>{progressPct}%</span>
                            <span>{formatDurationHours(durationSec)} hrs</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="fixed-deposit-actions" style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, color: "var(--cyan)" }}>
                        {formatEther4(d.amount)} ETH
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
                        {pending ? `${formatEther4(pending)} ETH` : "0.0000"}{" "}
                      </div>
                      <div className="fixed-action-row" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => onWithdraw(depositId)}
                          disabled={!address || d.withdrawn || isConfirming}
                          className="fixed-action-btn rounded-[12px] px-3 py-2"
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
                          disabled={!address || d.withdrawn || isConfirming}
                          className="fixed-action-btn rounded-[12px] px-3 py-2"
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
              <span className="metric-v blue">{formatEther4(fixedTotalApprox)} ETH</span>
            </div>
            <div className="metric">
              <span className="metric-k">{t("fixed.yourBalance")}</span>
              <span className="metric-v">{balanceData ? `${formatEther4(balanceData.value)} ETH` : "—"}</span>
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

