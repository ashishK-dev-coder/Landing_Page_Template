"use client";

import { motion } from "framer-motion";
import { EditableSection, EditableText } from "@/components/visual-editor";
import FadeIn from "../ui/FadeIn";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import type { DieticianKshitijaContent } from "../types";

export default function BenefitsSection({
  content,
}: {
  content: DieticianKshitijaContent["benefits"];
}) {
  return (
    <EditableSection sectionId="benefits" label="Benefits">
      <Section id="benefits" variant="white">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          highlight={content.highlight}
          subtitle={content.subtitle}
        />

        <div className="grid md:grid-cols-2 gap-3 md:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {content.items.map((benefit, index) => (
            <FadeIn key={`${benefit.title}-${index}`} delay={0.1 * (index + 1)}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group flex gap-3 md:gap-4 items-start bg-neutral-50 p-4 md:p-5 lg:p-6 rounded-2xl md:rounded-3xl border border-neutral-100 hover:bg-white hover:shadow-lg hover:shadow-neutral-200/40 transition-all duration-300 h-full"
              >
                <div className="flex-shrink-0 p-2 md:p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={benefit.icon}
                    alt=""
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-neutral-900 group-hover:text-brand transition-colors mb-1.5 md:mb-2 leading-snug">
                    <EditableText
                      sectionId="benefits"
                      save={{ type: "json", path: `benefits.items.${index}.title` }}
                      value={benefit.title}
                    />
                  </h3>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                    <EditableText
                      sectionId="benefits"
                      save={{ type: "json", path: `benefits.items.${index}.desc` }}
                      value={benefit.desc}
                      multiline
                    />
                  </p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </EditableSection>
  );
}
