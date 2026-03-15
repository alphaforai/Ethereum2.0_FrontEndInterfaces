export function Footer() {
  const links = ["Docs", "Audit Reports", "Bug Bounty", "DAO", "Terms"];
  return (
    <div
      className="border-t py-6 flex flex-wrap justify-between items-center gap-4"
      style={{ borderColor: "var(--border2)" }}
    >
      <div className="text-[15px] font-bold" style={{ color: "var(--blue-bright)" }}>
        EtherPrime Protocol
      </div>
      <div className="flex gap-6">
        {links.map((label) => (
          <button
            key={label}
            type="button"
            className="text-xs cursor-pointer transition-colors hover:opacity-80"
            style={{ color: "var(--dim)" }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="font-mono text-[11px]" style={{ color: "var(--dim)" }}>
        Audited · Trail of Bits · Certik
      </div>
    </div>
  );
}
