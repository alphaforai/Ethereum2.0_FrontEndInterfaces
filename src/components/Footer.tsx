export function Footer() {
  const links = ["Docs", "Audit Reports", "Bug Bounty", "DAO", "Terms"];
  return (
    <div className="footer-bar">
      <div className="footer-logo text-[15px] font-bold" style={{ color: "var(--blue-bright)" }}>
        EtherPrime Protocol
      </div>
      <div className="footer-links flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
        {links.map((label) => (
          <button key={label} type="button" className="footer-link text-xs cursor-pointer transition-colors hover:opacity-80" style={{ color: "var(--dim)" }}>
            {label}
          </button>
        ))}
      </div>
      <div className="footer-audit font-mono text-[11px]" style={{ color: "var(--dim)" }}>
        Audited · Trail of Bits · Certik
      </div>
    </div>
  );
}
