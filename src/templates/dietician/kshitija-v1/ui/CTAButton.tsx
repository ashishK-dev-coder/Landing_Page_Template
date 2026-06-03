"use client";

import { motion } from "framer-motion";
import { scrollToSection } from "./SmoothScrollLink";

export default function CTAButton({
  label,
  className = "",
  size = "default",
  href,
}: {
  label: string;
  className?: string;
  size?: "default" | "sm";
  href: string;
}) {
  const isAnchor = href.startsWith("#");
  const sizes = {
    default: "text-base md:text-lg px-7 py-3.5 md:px-10 md:py-4",
    sm: "text-sm md:text-base px-5 py-2.5 md:px-7 md:py-3",
  };

  return (
    <motion.a
      href={href}
      target={isAnchor ? undefined : "_blank"}
      rel={isAnchor ? undefined : "noopener noreferrer"}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`group inline-flex items-center justify-center bg-brand text-white font-semibold rounded-full shadow-lg shadow-brand/20 hover:bg-brand-dark transition-colors duration-300 ${sizes[size]} ${className}`}
      onClick={(e) => {
        if (!isAnchor) return;
        e.preventDefault();
        scrollToSection(href);
      }}
    >
      {label}
      <svg
        className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </motion.a>
  );
}
