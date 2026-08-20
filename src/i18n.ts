export function isJapaneseLocale(): boolean {
  try {
    const lang = String(
      (window.localStorage && window.localStorage.getItem("language")) || ""
    ).toLowerCase();
    if (lang.startsWith("ja")) return true;
  } catch {
    /* ignore */
  }
  try {
    return String(navigator.language || "").toLowerCase().startsWith("ja");
  } catch {
    return false;
  }
}

export function t(ja: string, en: string): string {
  return isJapaneseLocale() ? ja : en;
}
