"use client";

import React from "react";
import type { Locale } from "./locales";
import { messages, type MessageKey } from "./messages";

type I18nContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function I18nProviderWrapper(props: {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  children: React.ReactNode;
}) {
  const { locale, dir, setLocale, children } = props;

  const value = React.useMemo<I18nContextValue>(() => {
    return {
      locale,
      dir,
      setLocale,
      t: (key: MessageKey) => {
        return messages[locale]?.[key] ?? messages.en[key] ?? String(key);
      },
    };
  }, [locale, dir, setLocale]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

