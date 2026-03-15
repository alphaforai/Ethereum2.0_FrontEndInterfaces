"use client";

import { useMemo } from "react";

const CHART_HEIGHTS = [42, 48, 44, 52, 50, 55, 51, 60, 58, 62, 59, 67];
const VALIDATOR_COUNT = 88;

export function RightColumn() {
  const validatorDots = useMemo(
    () =>
      Array.from({ length: VALIDATOR_COUNT }, (_, i) => ({
        id: i,
        warn: i === 7 || i === 42,
        delay: (i * 0.005) % 0.5,
      })),
    []
  );

  return (
    <div className="right-col">
      {/* Protocol Health */}
      <div className="panel">
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-bright)]" />
          Protocol Health
        </div>
        {[
          ["TVL", "$2,841,293,044", "blue"],
          ["ETH Staked", "921,044 ETH", "text"],
          ["Validators", "28,814 active", "green"],
          ["epETH Supply", "878,231 epETH", "text"],
          ["Last Reward", "+0.0032 ETH · 12s ago", "green"],
          ["Audit", "✓ Trail of Bits · Certik", "green"],
        ].map(([k, v, color]) => (
          <div
            key={k}
            className="flex justify-between items-center py-2.5 border-b text-sm last:border-0"
            style={{ borderColor: "rgba(29,111,255,0.07)" }}
          >
            <span style={{ color: "var(--muted)" }}>{k}</span>
            <span
              className="font-semibold"
              style={{
                color:
                  color === "blue"
                    ? "var(--blue-bright)"
                    : color === "green"
                    ? "var(--green)"
                    : "var(--text)",
              }}
            >
              {v}
            </span>
          </div>
        ))}
        <div className="mt-3.5">
          <div className="text-[11px] font-mono mb-1.5" style={{ color: "var(--dim)" }}>APY 90D</div>
          <div className="h-[60px] flex items-end gap-0.5 mt-1">
            {CHART_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-opacity hover:opacity-100"
                style={{
                  height: `${h}%`,
                  background: "linear-gradient(180deg, var(--blue-bright), rgba(29,111,255,0.3))",
                  opacity: 0.7,
                  animation: "barUp 0.8s ease both",
                  animationDelay: `${i * 0.06}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Validator Network */}
      <div className="panel">
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-bright)]" />
          Validator Network
        </div>
        <div className="flex flex-wrap gap-1" style={{ minHeight: 40 }}>
          {validatorDots.map(({ id, warn, delay }) => (
            <div
              key={id}
              className="w-2.5 h-2.5 rounded-[3px] opacity-55 hover:opacity-100 transition-opacity"
              style={{
                background: warn ? "var(--yellow)" : "linear-gradient(135deg, var(--blue), var(--blue-bright))",
                animation: "vdPop 0.3s ease both",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
        <div className="flex gap-3 mt-2.5 text-[11px] font-mono" style={{ color: "var(--dim)" }}>
          <span style={{ color: "var(--blue-bright)" }}>■ Active (28,729)</span>
          <span style={{ color: "var(--yellow)" }}>■ Pending (85)</span>
        </div>
        <div className="mt-3.5">
          <div className="flex justify-between text-[11px] font-mono mb-1.5" style={{ color: "var(--dim)" }}>
            <span>Node Capacity</span>
            <span>68.4%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(29,111,255,0.1)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: "68.4%",
                background: "linear-gradient(90deg, var(--blue), var(--cyan))",
                boxShadow: "0 0 10px rgba(0,194,255,0.4)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Live Activity */}
      <div className="panel">
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-bright)]" />
          Live Activity
        </div>
        {[
          { icon: "⬇", type: "Stake", addr: "0x4f2a...c8e1", time: "8s ago", amt: "+32 ETH", pos: true },
          { icon: "💰", type: "Reward", addr: "0x91ba...44f2", time: "44s ago", amt: "+0.0328 ETH", pos: true },
          { icon: "⬇", type: "Stake", addr: "0x77dc...01a3", time: "2m ago", amt: "+5 ETH", pos: true },
          { icon: "⬆", type: "Unstake", addr: "0x23fe...9bc8", time: "4m ago", amt: "-8 ETH", pos: false },
        ].map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 border-b last:border-0"
            style={{ borderColor: "rgba(29,111,255,0.07)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{
                background:
                  a.type === "Stake"
                    ? "rgba(29,111,255,0.12)"
                    : a.type === "Reward"
                    ? "rgba(0,229,160,0.1)"
                    : "rgba(255,184,0,0.1)",
              }}
            >
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">{a.type}</div>
              <div className="font-mono text-[10px] mt-0.5" style={{ color: "var(--dim)" }}>
                {a.addr} · {a.time}
              </div>
            </div>
            <div
              className={`text-[13px] font-bold ${a.pos ? "" : ""}`}
              style={{ color: a.pos ? "var(--green)" : "var(--yellow)" }}
            >
              {a.amt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
