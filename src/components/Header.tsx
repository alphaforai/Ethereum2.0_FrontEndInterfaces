"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useI18n } from "@/i18n/useI18n";
import { locales } from "@/i18n/locales";

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();

  const nav = [
    { label: t("header.nav.stake"), href: "/" },
    { label: t("header.nav.portfolio"), href: "/" },
    { label: t("header.nav.analytics"), href: "/ranking" },
    { label: t("header.nav.governance"), href: "/fixed" },
  ];
  return (
    <header
      className="border-b sticky top-0 z-100"
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
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "nav-item active" : "nav-item"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="prime-header-actions flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div
              className="flex items-center gap-1.5 font-mono text-[11px] rounded-lg px-3 py-1.5"
              style={{
                color: "var(--green)",
                background: "rgba(0,229,160,0.08)",
                border: "1px solid rgba(0,229,160,0.2)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ animation: "netpulse 2s infinite" }}
              />
              {t("header.badge.mainnet")}
            </div>

            <select
              aria-label="Language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as any)}
              className="prime-lang-select"
              style={{
                background: "rgba(13,31,60,0.35)",
                border: "1px solid var(--border2)",
                color: "var(--text)",
                borderRadius: 12,
                padding: "10px 10px",
                fontSize: 12,
                outline: "none",
              }}
            >
              {locales.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>

            <ConnectButton
              label={t("header.connectWalletShort")}
              showBalance={false}
              chainStatus="icon"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
