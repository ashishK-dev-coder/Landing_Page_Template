/** Applies theme tokens from DB as CSS variables on the page wrapper */
export default function ThemeStyles({
  primaryColor,
  tokens,
}: {
  primaryColor?: string | null;
  tokens?: Record<string, string | number> | null;
}) {
  const primary = primaryColor ?? "#dc585a";
  const secondary = (tokens?.secondary as string) ?? "#c44a4c";
  const accent = (tokens?.accent as string) ?? primary;
  const pageBg = (tokens?.pageBg as string) ?? "#f8fafc";
  const pageFg = (tokens?.pageFg as string) ?? "#1f2937";
  const sectionBg = (tokens?.sectionBg as string) ?? "#ffffff";
  const mutedBg = (tokens?.mutedBg as string) ?? "#f1f5f9";

  return (
    <style>{`
      :root {
        --brand: ${primary};
        --brand-dark: ${secondary};
        --rose: ${primary};
        --rose-dark: ${secondary};
        --rose-light: color-mix(in srgb, ${primary} 12%, transparent);
        --page-bg: ${pageBg};
        --page-fg: ${pageFg};
        --section-bg: ${sectionBg};
        --muted-bg: ${mutedBg};
        --theme-accent: ${accent};
      }
    `}</style>
  );
}
