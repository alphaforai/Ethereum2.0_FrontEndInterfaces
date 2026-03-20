"use client";

import React from "react";
import type { Locale } from "./locales";
import { locales, normalizeLocale } from "./locales";
import { I18nProviderWrapper } from "./useI18n";

const STORAGE_KEY = "etherprime_locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) return normalizeLocale(saved);
  const nav = navigator.language || "en";
  return normalizeLocale(nav);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Hydration fix:
  // Server always renders with `en`. Client should also render `en` for the first paint,
  // then switch to the real locale in an effect to avoid SSR/client text mismatch.
  const [locale, setLocale] = React.useState<Locale>("en");

  // 1) On mount, read locale from localStorage / browser language.
  React.useEffect(() => {
    const next = getInitialLocale();
    setLocale(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Whenever locale changes, persist + update document attributes.
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }

    const loc = locales.find((l) => l.id === locale);
    const dir = loc?.dir ?? "ltr";

    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const dir = locales.find((l) => l.id === locale)?.dir ?? "ltr";

  return (
    <I18nProviderWrapper locale={locale} dir={dir} setLocale={setLocale}>
      {children}
    </I18nProviderWrapper>
  );
}

