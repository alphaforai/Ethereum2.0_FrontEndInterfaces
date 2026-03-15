export function Hero({ liveApy }: { liveApy: string }) {
  return (
    <section className="py-[72px] pb-[52px] text-center">
      <div className="container">
        <div
          className="inline-flex items-center gap-2 rounded-full pl-2.5 pr-4 py-1.5 mb-7 text-[13px] font-medium"
          style={{
            background: "rgba(29,111,255,0.08)",
            border: "1px solid rgba(29,111,255,0.2)",
            color: "var(--blue-bright)",
          }}
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-[11px]"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--cyan))",
            }}
          >
            ⚡
          </span>
          Season 2 Points Live · 2× Multiplier Active
        </div>
        <h1 className="text-[clamp(40px,6vw,72px)] font-extrabold leading-[1.05] tracking-tight mb-5">
          <span style={{ color: "var(--text)" }}>Liquid Staking<br />for the </span>
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--blue-bright) 0%, var(--cyan) 60%, #7eb8ff 100%)",
            }}
          >
            Ethereum Age
          </span>
        </h1>
        <p
          className="text-[17px] max-w-[500px] mx-auto mb-9 leading-[1.75] font-normal"
          style={{ color: "var(--muted)" }}
        >
          Non-custodial ETH staking with instant liquidity, real-time rewards, and protocol points. No lock-ups.
        </p>
        <div
          className="inline-flex flex-col sm:flex-row gap-0 border rounded-[14px] overflow-hidden mb-12"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div
            className="px-7 py-3.5 text-center border-b sm:border-b-0 sm:border-r"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-[22px] font-bold block" style={{ color: "var(--blue-bright)" }}>$2.84B</span>
            <span className="text-[11px] mt-0.5 font-normal" style={{ color: "var(--muted)" }}>Total Value Locked</span>
          </div>
          <div
            className="px-7 py-3.5 text-center border-b sm:border-b-0 sm:border-r"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-[22px] font-bold block" style={{ color: "var(--text)" }}>{liveApy}</span>
            <span className="text-[11px] mt-0.5 font-normal" style={{ color: "var(--muted)" }}>Live APY</span>
          </div>
          <div
            className="px-7 py-3.5 text-center border-b sm:border-b-0 sm:border-r"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-[22px] font-bold block" style={{ color: "var(--green)" }}>28,814</span>
            <span className="text-[11px] mt-0.5 font-normal" style={{ color: "var(--muted)" }}>Active Validators</span>
          </div>
          <div className="px-7 py-3.5 text-center">
            <span className="text-[22px] font-bold block" style={{ color: "var(--text)" }}>48,391</span>
            <span className="text-[11px] mt-0.5 font-normal" style={{ color: "var(--muted)" }}>Stakers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
