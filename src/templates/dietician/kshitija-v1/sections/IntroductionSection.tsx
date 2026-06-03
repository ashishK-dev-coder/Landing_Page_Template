import { EditableImage, EditableSection, EditableText } from "@/components/visual-editor";
import FadeIn from "../ui/FadeIn";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import type { DieticianKshitijaContent } from "../types";

export default function IntroductionSection({
  content,
}: {
  content: DieticianKshitijaContent["introduction"];
}) {
  return (
    <EditableSection sectionId="introduction" label="About">
      <Section id="introduction" variant="light">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          highlight={content.highlight}
          subtitle={content.subtitle}
        />

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center max-w-5xl mx-auto">
          <FadeIn>
            <div className="relative">
              <div className="absolute -inset-2 bg-brand/10 rounded-3xl blur-xl" />
              <EditableImage
                sectionId="introduction"
                jsonPath="introduction.imageUrl"
                src={content.imageUrl}
                alt={content.imageAlt}
                className="relative w-full h-auto rounded-3xl border border-neutral-100 shadow-sm"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            {content.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`text-neutral-700 leading-relaxed text-sm md:text-base ${i > 0 ? "mt-4" : ""}`}
              >
                <EditableText
                  sectionId="introduction"
                  save={{ type: "json", path: `introduction.paragraphs.${i}` }}
                  value={paragraph}
                  multiline
                  label={`Bio paragraph ${i + 1}`}
                />
              </p>
            ))}
          </FadeIn>
        </div>
      </Section>
    </EditableSection>
  );
}
