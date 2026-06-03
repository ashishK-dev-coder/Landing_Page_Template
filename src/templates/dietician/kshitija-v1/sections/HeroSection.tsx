import {
  EditableSection,
  EditableText,
} from "@/components/visual-editor";
import FadeIn from "../ui/FadeIn";
import CTAButton from "../ui/CTAButton";
import Section from "../ui/Section";
import type { DieticianKshitijaContent } from "../types";

export default function HeroSection({ content }: { content: DieticianKshitijaContent["hero"] }) {
  return (
    <EditableSection sectionId="hero" label="Hero">
      <Section
        id="hero"
        variant="soft"
        containerClass="max-w-4xl mx-auto px-4 md:px-6 relative"
        className="pt-2 pb-8 md:py-16 lg:py-20"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-brand/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-48 md:w-64 h-48 md:h-64 bg-brand/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center">
          <FadeIn>
            <div className="inline-flex items-center bg-white/90 border border-neutral-100 shadow-sm rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-4 md:mb-8">
              <p className="text-xs md:text-sm font-semibold tracking-wide text-neutral-600">
                <EditableText
                  sectionId="hero"
                  save={{ type: "json", path: "hero.badgePrimary" }}
                  value={content.badgePrimary}
                  className="text-brand"
                />
                <span className="mx-2 text-neutral-300">|</span>
                <EditableText
                  sectionId="hero"
                  save={{ type: "json", path: "hero.badgeSecondary" }}
                  value={content.badgeSecondary}
                />
              </p>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.12] text-neutral-900 mb-4 md:mb-6 tracking-tight">
              <EditableText
                sectionId="hero"
                save={{ type: "json", path: "hero.headline" }}
                value={content.headline}
                as="span"
              />{" "}
              <span className="text-brand relative inline-block">
                <EditableText
                  sectionId="hero"
                  save={{ type: "json", path: "hero.headlineHighlight" }}
                  value={content.headlineHighlight}
                  as="span"
                  className="text-brand"
                />
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2 text-brand/30"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm md:text-lg text-neutral-600 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
              <EditableText
                sectionId="hero"
                save={{ type: "json", path: "hero.subheading" }}
                value={content.subheading}
                as="span"
              />{" "}
              <span className="text-neutral-900 font-semibold border-b-2 border-brand/30">
                <EditableText
                  sectionId="hero"
                  save={{ type: "json", path: "hero.subheadingEmphasis" }}
                  value={content.subheadingEmphasis}
                  as="span"
                />
              </span>{" "}
              <EditableText
                sectionId="hero"
                save={{ type: "json", path: "hero.subheadingSuffix" }}
                value={content.subheadingSuffix}
                as="span"
              />
            </p>

            <CTAButton label={content.ctaLabel} href={content.ctaHref} />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-lg mx-auto mt-6 md:mt-10">
              {content.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white border border-neutral-100 px-2 py-3 md:px-4 md:py-4 shadow-sm"
                >
                  <p className="text-lg md:text-2xl font-bold text-brand">
                    <EditableText
                      sectionId="hero"
                      save={{ type: "json", path: `hero.stats.${index}.value` }}
                      value={stat.value}
                    />
                  </p>
                  <p className="text-[10px] md:text-xs text-neutral-500 mt-0.5">
                    <EditableText
                      sectionId="hero"
                      save={{ type: "json", path: `hero.stats.${index}.label` }}
                      value={stat.label}
                    />
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </Section>
    </EditableSection>
  );
}
