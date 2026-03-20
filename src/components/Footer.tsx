 "use client";

import { useI18n } from "@/i18n/useI18n";

export function Footer() {
  const { t } = useI18n();
  const links = [
    t("footer.link.docs"),
    t("footer.link.auditReports"),
    t("footer.link.bugBounty"),
    t("footer.link.dao"),
    t("footer.link.terms"),
  ];
  return (
    <div className="footer-bar">
      <div
        className="footer-logo text-[15px] font-bold"
        style={{ color: "var(--blue-bright)" }}
      >
        {t("footer.logo")}
      </div>
      <div className="footer-links flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
        {links.map((label) => (
          <button key={label} type="button" className="footer-link text-xs cursor-pointer transition-colors hover:opacity-80" style={{ color: "var(--dim)" }}>
            {label}
          </button>
        ))}
      </div>
      <div className="footer-audit font-mono text-[11px]" style={{ color: "var(--dim)" }}>
        {t("footer.audit")}
      </div>
    </div>
  );
}
