"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header
      className="border-b sticky top-0 z-[100]"
      style={{
        borderColor: "var(--border)",
        backdropFilter: "blur(24px)",
        background: "rgba(5,10,26,0.75)",
      }}
    >
      <div className="container">
        <div className="header-inner">
          <div className="flex items-center gap-3">
            <div
              className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #1d6fff, #627eea)",
                boxShadow: "0 0 20px rgba(29,111,255,0.5)",
              }}
            >
              <span className="text-white text-xl font-bold leading-none">Ξ</span>
            </div>
            <span className="text-lg font-bold tracking-[-0.3px]" style={{ color: "var(--text)" }}>
              Ether<span style={{ color: "var(--blue-bright)" }}>Prime</span>
            </span>
          </div>
          <nav className="header-nav">
            {["Stake", "Portfolio", "Analytics", "Governance"].map((label, i) => (
              <button
                key={label}
                type="button"
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === 0 ? "nav-item active" : "nav-item"}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div
              className="flex items-center gap-1.5 font-mono text-[11px] rounded-lg px-3 py-1.5"
              style={{
                color: "var(--green)",
                background: "rgba(0,229,160,0.08)",
                border: "1px solid rgba(0,229,160,0.2)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"
                style={{ animation: "netpulse 2s infinite" }}
              />
              Mainnet
            </div>
            <ConnectButton
              label="Connect Wallet"
              showBalance={false}
              chainStatus="icon"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
