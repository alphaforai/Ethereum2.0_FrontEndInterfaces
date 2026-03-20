 "use client";

import { useI18n } from "@/i18n/useI18n";

export function Hero({ liveApy }: { liveApy: string }) {
  const { t } = useI18n();
  const [titleLine1, titleLine2] = (t("hero.title1") ?? "").split("\n");
  return (
    <section className="hero pt-[72px] pb-[52px] text-center">
      <div className="container">
        <div
          className="hero-eyebrow inline-flex items-center gap-2 rounded-full pl-2.5 pr-4 py-1.5 mb-7 text-[13px] font-medium"
          style={{
            background: "rgba(29,111,255,0.08)",
            border: "1px solid rgba(29,111,255,0.2)",
            color: "var(--blue-bright)",
          }}
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--cyan))",
            }}
          >
            ⚡
          </span>
          {t("hero.eyebrow")}
        </div>
        <h1 className="text-[clamp(40px,6vw,72px)] font-extrabold leading-[1.05] tracking-[-2px] mb-5">
          <span className="h1-white">
            {titleLine1}
            <br />
            {titleLine2}
          </span>
          <span className="h1-blue">{t("hero.title2")}</span>
        </h1>
        <p
          className="hero-sub text-[17px] max-w-[500px] mx-auto mb-9 leading-[1.75] font-normal"
          style={{ color: "var(--muted)" }}
        >
          {t("hero.subtitle")}
        </p>
        <div className="hero-stats">
          <div className="hstat">
            <span className="hstat-val blue">$2.84B</span>
            <span className="hstat-label">{t("hero.stats.tvl")}</span>
          </div>
          <div className="hstat">
            <span className="hstat-val">{liveApy}</span>
            <span className="hstat-label">{t("hero.stats.liveApy")}</span>
          </div>
          <div className="hstat">
            <span className="hstat-val green">28,814</span>
            <span className="hstat-label">{t("hero.stats.validators")}</span>
          </div>
          <div className="hstat">
            <span className="hstat-val">48,391</span>
            <span className="hstat-label">{t("hero.stats.stakers")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
