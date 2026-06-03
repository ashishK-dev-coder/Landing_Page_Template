import FadeIn from "./FadeIn";

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <FadeIn className={`text-center max-w-3xl mx-auto mb-8 md:mb-12 ${className}`}>
      {eyebrow ? (
        <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-brand mb-3 md:mb-4">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
        {title}{" "}
        {highlight ? <span className="text-brand italic">{highlight}</span> : null}
      </h2>
      {subtitle ? (
        <p className="mt-3 md:mt-5 text-sm md:text-lg text-neutral-600 leading-relaxed px-1">
          {subtitle}
        </p>
      ) : null}
    </FadeIn>
  );
}
