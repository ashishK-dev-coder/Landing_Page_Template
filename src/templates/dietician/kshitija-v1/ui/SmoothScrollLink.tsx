"use client";

const HEADER_OFFSET = 56;

export function scrollToSection(href: string) {
  const id = href.replace("#", "");
  const element = document.getElementById(id);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function SmoothScrollLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (!href.startsWith("#")) return;
        e.preventDefault();
        scrollToSection(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
