"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { EditableImage, EditableSection } from "@/components/visual-editor";
import FadeIn from "../ui/FadeIn";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import type { DieticianKshitijaContent } from "../types";

export default function ReviewsSection({
  content,
}: {
  content: DieticianKshitijaContent["reviews"];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <EditableSection sectionId="reviews" label="Reviews">
      <Section id="reviews" variant="light">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          highlight={content.highlight}
          subtitle={content.subtitle}
        />

        <FadeIn delay={0.1}>
          <div
            ref={scrollerRef}
            className="flex gap-3 md:gap-5 overflow-x-auto pb-4 md:pb-5 snap-x snap-proximity hide-scrollbar -mx-1 px-1"
            style={{
              overscrollBehaviorX: "contain",
              overscrollBehaviorY: "auto",
              touchAction: "pan-x pan-y",
            }}
          >
            {content.images.map((src, index) => (
              <motion.div
                key={`${src}-${index}`}
                whileHover={{ scale: 1.01 }}
                style={{ touchAction: "pan-x pan-y" }}
                className="snap-center shrink-0 w-[78vw] sm:w-[320px] md:w-[420px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-xl shadow-neutral-200/80 border-2 md:border-4 border-white bg-white"
              >
                <EditableImage
                  sectionId="reviews"
                  jsonPath={`reviews.images.${index}`}
                  src={src}
                  alt={`Client review ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-center text-xs text-neutral-400 mt-2 md:mt-3">
            {content.swipeHint}
          </p>
        </FadeIn>
      </Section>
    </EditableSection>
  );
}
