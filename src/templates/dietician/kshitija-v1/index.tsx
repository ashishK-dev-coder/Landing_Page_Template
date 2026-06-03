"use client";

import { motion } from "framer-motion";
import { useEditMode } from "@/components/visual-editor/EditModeContext";
import { useThemePreview } from "@/components/templates/ThemePreviewContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ThemeStyles from "./ThemeStyles";
import HeroSection from "./sections/HeroSection";
import VideoSection from "./sections/VideoSection";
import BenefitsSection from "./sections/BenefitsSection";
import IntroductionSection from "./sections/IntroductionSection";
import ReviewsSection from "./sections/ReviewsSection";
import type { DieticianKshitijaContent } from "./types";

export type TemplateRenderProps = {
  content: DieticianKshitijaContent;
  siteSlug?: string;
  theme?: {
    primaryColor?: string | null;
    tokens?: Record<string, string | number> | null;
  };
};

export default function DieticianKshitijaTemplate({
  content: contentProp,
  siteSlug,
  theme,
}: TemplateRenderProps) {
  const { isEditMode, visualContent } = useEditMode();
  const { theme: previewTheme } = useThemePreview();
  const content = (isEditMode ? visualContent : contentProp) as TemplateRenderProps["content"];
  const activeTheme = isEditMode && previewTheme ? previewTheme : theme;

  return (
    <>
      <ThemeStyles
        primaryColor={activeTheme?.primaryColor}
        tokens={activeTheme?.tokens ?? null}
      />
      <div
        className="min-h-full flex flex-col font-sans"
        style={{ backgroundColor: "var(--page-bg)", color: "var(--page-fg)" }}
      >
        <Navbar brand={content.brand} nav={content.nav} />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-x-hidden selection:bg-brand selection:text-white flex-1"
        >
          <HeroSection content={content.hero} />
          <VideoSection content={content.video} siteSlug={siteSlug} />
          <BenefitsSection content={content.benefits} />
          <IntroductionSection content={content.introduction} />
          <ReviewsSection content={content.reviews} />
        </motion.main>
        <Footer content={content.footer} />
      </div>
    </>
  );
}
