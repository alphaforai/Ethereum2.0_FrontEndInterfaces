export function BottomRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {/* Season 2 Points - spans 2 cols on md */}
      <div
        className="md:col-span-2 rounded-[18px] p-5 relative overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(29,111,255,0.4), transparent)",
          }}
        />
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-bright)]" />
          Season 2 Points
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-4xl font-extrabold" style={{ color: "var(--yellow)" }}>—</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono" style={{ color: "var(--dim)" }}>ENDS IN 47D 12H</div>
            <div className="mt-1.5 text-[13px]" style={{ color: "var(--muted)" }}>Connect wallet to track</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-mono mb-1.5" style={{ color: "var(--dim)" }}>
            <span>Progress to Level 8</span>
            <span>73%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(29,111,255,0.1)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: "73%",
                background: "linear-gradient(90deg, var(--blue), var(--cyan))",
                boxShadow: "0 0 10px rgba(0,194,255,0.4)",
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { num: 1, label: "Starter", done: true },
            { num: 3, label: "Builder", done: true },
            { num: 5, label: "Staker", done: true },
            { num: 7, label: "Whale", current: true },
            { num: 10, label: "Diamond", locked: true },
          ].map((l) => (
            <div
              key={l.num}
              className="text-center py-2 px-1.5 rounded-[10px] text-[11px] border"
              style={{
                borderColor: l.current ? "var(--cyan)" : "var(--border2)",
                background: l.current
                  ? "linear-gradient(135deg, rgba(29,111,255,0.2), rgba(0,194,255,0.1))"
                  : l.done
                  ? "rgba(29,111,255,0.1)"
                  : "transparent",
                color: l.current ? "var(--cyan)" : l.done ? "var(--blue-bright)" : "var(--dim)",
              }}
            >
              <span className="text-lg font-extrabold block mb-0.5">{l.num}</span>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Refer & Earn */}
      <div
        className="rounded-[18px] p-5 relative overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(29,111,255,0.4), transparent)",
          }}
        />
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-bright)]" />
          Refer & Earn
        </div>
        <p className="text-[13px] leading-relaxed mb-1" style={{ color: "var(--muted)" }}>
          Earn <strong style={{ color: "var(--text)" }}>10% of referrals&apos; points</strong> forever. No cap.
        </p>
        <div
          className="w-full rounded-[10px] py-2.5 px-3.5 font-mono text-[13px] font-semibold text-center tracking-[0.2em] cursor-pointer my-3 transition-colors border border-dashed hover:border-[var(--blue)]"
          style={{
            background: "var(--surface2)",
            borderColor: "rgba(29,111,255,0.3)",
            color: "var(--blue-bright)",
          }}
        >
          EP-XXXX-XXXX
        </div>
        <div className="text-[11px] font-mono text-center" style={{ color: "var(--dim)" }}>Click to copy your link</div>
        <div className="flex gap-2 mt-3">
          <div
            className="flex-1 rounded-lg py-2 text-center text-xs"
            style={{ background: "var(--surface2)", color: "var(--muted)" }}
          >
            <div className="text-lg font-bold" style={{ color: "var(--text)" }}>—</div>
            Friends
          </div>
          <div
            className="flex-1 rounded-lg py-2 text-center text-xs"
            style={{ background: "var(--surface2)", color: "var(--muted)" }}
          >
            <div className="text-lg font-bold" style={{ color: "var(--yellow)" }}>2×</div>
            Multiplier
          </div>
        </div>
      </div>
    </div>
  );
}
