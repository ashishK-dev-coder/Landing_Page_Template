"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ThemePreviewValue = {
  themeId: string | null;
  combinationIndex: number | null;
  primaryColor?: string | null;
  tokens?: Record<string, string | number> | null;
};

type ThemePreviewContextValue = {
  theme: ThemePreviewValue | null;
  setTheme: (value: ThemePreviewValue) => void;
};

const ThemePreviewContext = createContext<ThemePreviewContextValue | null>(null);

export function ThemePreviewProvider({
  initialTheme,
  children,
}: {
  initialTheme?: ThemePreviewValue | null;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemePreviewValue | null>(initialTheme ?? null);
  const setTheme = useCallback((next: ThemePreviewValue) => {
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return <ThemePreviewContext.Provider value={value}>{children}</ThemePreviewContext.Provider>;
}

export function useThemePreview() {
  const ctx = useContext(ThemePreviewContext);
  return (
    ctx ?? {
      theme: null,
      setTheme: () => {},
    }
  );
}
