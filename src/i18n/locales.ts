export type Locale = "en" | "zh" | "ja" | "ko" | "ar" | "fr" | "de" | "ru" | "it";

export const locales: Array<{ id: Locale; label: string; dir: "ltr" | "rtl" }> = [
  { id: "en", label: "English", dir: "ltr" },
  { id: "zh", label: "简体中文", dir: "ltr" },
  { id: "ja", label: "日本語", dir: "ltr" },
  { id: "ko", label: "한국어", dir: "ltr" },
  { id: "ar", label: "العربية", dir: "rtl" },
  { id: "fr", label: "Français", dir: "ltr" },
  { id: "de", label: "Deutsch", dir: "ltr" },
  { id: "ru", label: "Русский", dir: "ltr" },
  { id: "it", label: "Italiano", dir: "ltr" },
];

export function normalizeLocale(input?: string | null): Locale {
  const v = (input ?? "").toLowerCase();
  if (v.startsWith("zh")) return "zh";
  if (v.startsWith("ja")) return "ja";
  if (v.startsWith("ko")) return "ko";
  if (v.startsWith("ar")) return "ar";
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("de")) return "de";
  if (v.startsWith("ru")) return "ru";
  if (v.startsWith("it")) return "it";
  return "en";
}

