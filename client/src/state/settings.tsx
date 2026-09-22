import { createContext, useContext, useMemo, type ReactNode } from "react";
import { translate, type TranslationKey } from "../lib/i18n";

type I18nContextValue = {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nContextValue>(
    () => ({
      t: (key, params) => translate(key, params),
    }),
    [],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
