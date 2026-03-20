"use client";

import React from "react";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { parseAbiItem, type Address } from "viem";
import { formatEther4 } from "@/utils/formatEther4";
import { wagmiContractConfig as flexibleContractConfig } from "@/config/FlexibleStakingB_ContractConfig";
import { fixedStakingA_ContractConfig } from "@/config/fixedStakingA_ContractConfig";
import { mainnet } from "wagmi/chains";
import { useI18n } from "@/i18n/useI18n";

type RankItem = {
  user: Address;
  amount: bigint;
};

const ZERO = BigInt("0");
const HISTORY_BLOCK_WINDOW = BigInt("5000");

function shortAddr(addr: Address) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function RankingDApp() {
  const chainId = mainnet.id;
  const publicClient = usePublicClient({ chainId });
  const { t } = useI18n();

  const [items, setItems] = React.useState<RankItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (!publicClient) return;
        const latest = await publicClient.getBlockNumber();
        const fromBlock = latest - HISTORY_BLOCK_WINDOW;

        const flexibleDeposit = parseAbiItem(
          "event Deposit(address indexed user, uint256 amount)",
        );
        const flexibleWithdraw = parseAbiItem(
          "event Withdraw(address indexed user, uint256 amount)",
        );

        const fixedDeposited = parseAbiItem(
          "event Deposited(address indexed user, uint256 indexed depositId, uint256 amount, uint256 poolId)",
        );
        const fixedWithdrawn = parseAbiItem(
          "event Withdrawn(address indexed user, uint256 indexed depositId, uint256 amount, uint256 reward, uint256 elapsed, uint256 duration)",
        );

        const [fDep, fWit, fxDep, fxWit] = await Promise.all([
          publicClient.getLogs({
            address: flexibleContractConfig.address,
            event: flexibleDeposit,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: flexibleContractConfig.address,
            event: flexibleWithdraw,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: fixedStakingA_ContractConfig.address,
            event: fixedDeposited,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: fixedStakingA_ContractConfig.address,
            event: fixedWithdrawn,
            fromBlock,
            toBlock: latest,
          }),
        ]);

        const net = new Map<Address, bigint>();
        const add = (user: Address, delta: bigint) => {
          net.set(user, (net.get(user) ?? ZERO) + delta);
        };

        for (const l of fDep) add(l.args.user as Address, l.args.amount as bigint);
        for (const l of fWit)
          add(l.args.user as Address, -(l.args.amount as bigint));
        for (const l of fxDep)
          add(l.args.user as Address, l.args.amount as bigint);
        for (const l of fxWit)
          add(l.args.user as Address, -(l.args.amount as bigint));

        const ranked = Array.from(net.entries())
          .map(([user, amount]) => ({ user, amount }))
          .filter((x) => x.amount > ZERO)
          .sort((a, b) => (a.amount > b.amount ? -1 : 1))
          .slice(0, 10);

        if (!cancelled) setItems(ranked);
      } catch (e) {
        console.error(e);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  const total = items.reduce((acc, x) => acc + x.amount, ZERO);

  return (
    <div className="main-grid">
      <div className="stake-card">
        <div className="flex justify-between items-start mb-6">
          <span className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            {t("rank.title")}
          </span>
          <Link
            href="/"
            className="rounded-[12px] px-3 py-2"
            style={{
              background: "rgba(29,111,255,0.08)",
              border: "1px solid rgba(29,111,255,0.18)",
              color: "var(--blue-bright)",
              fontWeight: 900,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            ← {t("rank.back")}
          </Link>
        </div>

        <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
          {t("rank.computed")} <b>Deposit/Withdraw events</b> over last{" "}
          <b>{HISTORY_BLOCK_WINDOW.toString()}</b> blocks. (Approx)
        </div>

        <div style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ color: "var(--dim)" }}>{t("rank.loading")}</div>
          ) : items.length === 0 ? (
            <div style={{ color: "var(--dim)" }}>{t("rank.noData")}</div>
          ) : (
            <div>
              {items.map((it, idx) => (
                <div
                  key={it.user}
                  className="flex justify-between items-center py-3 border-b"
                  style={{ borderColor: "var(--border2)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          idx === 0
                            ? "rgba(255,184,0,0.12)"
                            : "rgba(29,111,255,0.08)",
                        border:
                          idx === 0
                            ? "1px solid rgba(255,184,0,0.2)"
                            : "1px solid rgba(29,111,255,0.18)",
                        color: idx === 0 ? "var(--yellow)" : "var(--blue-bright)",
                        fontWeight: 1000,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ fontWeight: 900, color: "var(--text)" }}>
                      {shortAddr(it.user)}
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)" as any, color: "var(--green)", fontWeight: 900 }}>
                    {formatEther4(it.amount)} ETH
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="right-col">
        <div className="panel">
          <div className="panel-title">
            <span className="panel-title-dot" /> {t("rank.snapshot")}
          </div>
          <div className="metric">
            <span className="metric-k">{t("rank.top10")}</span>
            <span className="metric-v blue">{formatEther4(total)} ETH</span>
          </div>
          <div className="metric">
            <span className="metric-k">{t("rank.window")}</span>
            <span className="metric-v">{HISTORY_BLOCK_WINDOW.toString()}</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <span className="panel-title-dot" /> {t("rank.upgradeInterestTitle")}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
            {t("rank.upgradeInterest")}
          </div>
          <div style={{ marginTop: 14 }}>
            <Link
              href="/fixed"
              className="rounded-[14px] px-4 py-3 block text-center"
              style={{
                background: "rgba(29,111,255,0.08)",
                border: "1px solid rgba(29,111,255,0.18)",
                color: "var(--blue-bright)",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              ⚡ {t("rank.goFixed")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

