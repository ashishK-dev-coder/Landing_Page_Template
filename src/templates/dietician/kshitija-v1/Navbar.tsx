"use client";

import { EditableImage, EditableSection } from "@/components/visual-editor";
import CTAButton from "./ui/CTAButton";
import SmoothScrollLink from "./ui/SmoothScrollLink";
import type { DieticianKshitijaContent } from "./types";

export default function Navbar({
  brand,
  nav,
}: {
  brand: DieticianKshitijaContent["brand"];
  nav: DieticianKshitijaContent["nav"];
}) {
  return (
    <EditableSection sectionId="brand" label="Brand / Nav">
      <header className="sticky top-0 z-50 border-b border-neutral-100/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-12 md:h-14 flex items-center justify-between gap-3">
          <SmoothScrollLink
            href="#hero"
            className="shrink-0 hover:opacity-90 transition-opacity leading-none flex items-center h-full"
          >
            <EditableImage
              sectionId="brand"
              jsonPath="brand.logoUrl"
              src={brand.logoUrl}
              alt={`${brand.name} logo`}
              className="h-10 w-auto md:h-12 object-contain max-w-none"
            />
          </SmoothScrollLink>

          <nav className="hidden md:flex items-center gap-0.5">
            {nav.links.map((link) => (
              <SmoothScrollLink
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 rounded-full text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                {link.label}
              </SmoothScrollLink>
            ))}
          </nav>

          <div className="hidden md:block shrink-0">
            <CTAButton size="sm" label={nav.ctaLabel} href="#video-form" />
          </div>
        </div>
      </header>
    </EditableSection>
  );
}
