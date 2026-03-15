"use client";

import { useState, useCallback } from "react";

const ETH_PRICE = 3120;
const RATE = 0.9539;

type StakeCardProps = {
  apy: number;
  apyStr: string;
};

export function StakeCard({ apy, apyStr }: StakeCardProps) {
  const [ethAmount, setEthAmount] = useState("2.00");
  const [isConfirming, setIsConfirming] = useState(false);

  const epethOut = (parseFloat(ethAmount) || 0) * RATE;
  const ethUsd = (parseFloat(ethAmount) || 0) * ETH_PRICE;
  const epethUsd = epethOut * ETH_PRICE;
  const points = (parseFloat(ethAmount) || 0) * 100;

  const ringOffset = 326 - 326 * ((apy - 4) / 2) * 0.9;

  const handleStake = useCallback(() => {
    setIsConfirming(true);
    setTimeout(() => setIsConfirming(false), 2500);
  }, []);

  return (
    <div
      className="rounded-[20px] p-7 relative overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{
          background: "linear-gradient(90deg, transparent, var(--blue), var(--cyan), transparent)",
        }}
      />
      <div className="flex justify-between items-start mb-6">
        <span
          className="text-[13px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted)" }}
        >
          Stake ETH
        </span>
        <span
          className="flex items-center gap-1.5 font-mono text-[10px] font-semibold rounded-md px-2.5 py-1"
          style={{
            color: "var(--green)",
            background: "rgba(0,229,160,0.08)",
            border: "1px solid rgba(0,229,160,0.18)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          Live
        </span>
      </div>

      {/* APY ring */}
      <div
        className="flex items-center justify-center gap-8 mb-7 p-6 rounded-2xl mb-7"
        style={{
          background: "linear-gradient(135deg, rgba(29,111,255,0.06), rgba(0,194,255,0.03))",
          border: "1px solid var(--border)",
        }}
      >
        <div className="relative w-[120px] h-[120px]">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d6fff" />
                <stop offset="100%" stopColor="#00c2ff" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(29,111,255,0.12)" strokeWidth="6" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="326"
              strokeDashoffset={ringOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-extrabold leading-none bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, var(--blue-bright), var(--cyan))",
              }}
            >
              {apyStr}
            </span>
            <span className="font-mono text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>APY</span>
          </div>
        </div>
        <div className="flex-1 space-y-0">
          {[
            ["Exchange Rate", "1 epETH = 1.0487 ETH", "var(--blue-bright)"],
            ["Protocol Fee", "10% of yield", "var(--text)"],
            ["Withdrawal", "~3 days", "var(--text)"],
            ["Insurance", "12,400 ETH", "var(--green)"],
            ["Slash Events", "0 (all time)", "var(--green)"],
          ].map(([key, val, color]) => (
            <div
              key={key}
              className="flex justify-between items-center py-2 border-b text-[13px] last:border-0"
              style={{ borderColor: "rgba(29,111,255,0.07)" }}
            >
              <span style={{ color: "var(--muted)" }}>{key}</span>
              <span className="font-semibold" style={{ color: color as string }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-5">
        <div
          className="rounded-[14px] px-[18px] py-4 flex justify-between items-center mb-2 border transition-colors focus-within:border-[var(--blue)]"
          style={{
            background: "var(--surface2)",
            borderColor: "var(--border)",
          }}
        >
          <div>
            <div
              className="flex items-center gap-2 rounded-[10px] px-3 py-2 cursor-pointer border"
              style={{
                background: "var(--surface3)",
                borderColor: "var(--border2)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #627eea, #a5b4fc)" }}
              >
                Ξ
              </div>
              <span className="text-[15px] font-bold">ETH</span>
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>▾</span>
            </div>
            <div className="font-mono text-[11px] mt-0.5" style={{ color: "var(--dim)" }}>Balance: 4.20 ETH</div>
          </div>
          <div className="text-right">
            <input
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent border-none outline-none text-right w-40 text-[28px] font-bold font-sans"
              style={{ color: "var(--text)" }}
            />
            <div className="font-mono text-xs mt-0.5 text-right" style={{ color: "var(--dim)" }}>
              ≈ ${ethUsd.toLocaleString("en", { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="text-center my-1">
          <button
            type="button"
            className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[10px] border transition-all hover:scale-105"
            style={{
              background: "var(--surface3)",
              borderColor: "var(--border)",
              color: "var(--blue-bright)",
            }}
          >
            ⇅
          </button>
        </div>

        <div
          className="rounded-[14px] px-[18px] py-4"
          style={{
            background: "linear-gradient(135deg, rgba(29,111,255,0.06), rgba(0,194,255,0.03))",
            border: "1px solid rgba(29,111,255,0.15)",
          }}
        >
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>You receive</span>
            <span
              className="font-mono text-[10px] rounded-md px-2 py-0.5"
              style={{
                color: "var(--cyan)",
                background: "rgba(0,194,255,0.08)",
                border: "1px solid rgba(0,194,255,0.15)",
              }}
            >
              epETH
            </span>
          </div>
          <div className="text-[28px] font-bold mb-1" style={{ color: "var(--blue-bright)" }}>
            {epethOut.toFixed(4)}
          </div>
          <div className="text-xs flex gap-4" style={{ color: "var(--muted)" }}>
            <span>≈ ${epethUsd.toLocaleString("en", { maximumFractionDigits: 0 })}</span>
            <span>Rate: 1 ETH = {RATE} epETH</span>
          </div>
          <div
            className="flex justify-between text-xs font-mono pt-2.5 mt-3 border-t"
            style={{ color: "var(--dim)", borderColor: "var(--border2)" }}
          >
            <span>Network fee: ~$2.40</span>
            <span>Slippage: 0.00%</span>
            <span>Price impact: &lt;0.01%</span>
          </div>
        </div>
      </div>

      {/* Points */}
      <div
        className="flex items-center justify-between rounded-[10px] px-3.5 py-2.5 mb-4"
        style={{
          background: "linear-gradient(135deg, rgba(255,184,0,0.06), rgba(255,184,0,0.02))",
          border: "1px solid rgba(255,184,0,0.15)",
        }}
      >
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-base">🎯</span>
          <span style={{ color: "var(--muted)" }}>Season 2 points bonus</span>
        </div>
        <span className="font-bold" style={{ color: "var(--yellow)" }}>+{points.toFixed(0)} pts</span>
      </div>

      <button
        type="button"
        onClick={handleStake}
        disabled={isConfirming}
        className="w-full py-4 rounded-[14px] text-white font-bold text-base tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-80"
        style={{
          background: "linear-gradient(135deg, var(--blue) 0%, #3b7fff 50%, var(--cyan) 100%)",
          boxShadow: "0 4px 24px rgba(29,111,255,0.45)",
        }}
      >
        {isConfirming ? (
          "⏳ Confirm in Wallet..."
        ) : (
          <>
            ⚡ Stake ETH
            <span className="block text-[11px] font-normal mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              Non-custodial · Withdraw anytime
            </span>
          </>
        )}
      </button>
    </div>
  );
}
