"use client";

import { motion } from "framer-motion";

export default function Section({
  id,
  children,
  className = "",
  variant = "light",
  containerClass = "max-w-6xl mx-auto px-4 md:px-6",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "white" | "soft";
  containerClass?: string;
}) {
  const backgrounds = {
    light: "bg-neutral-50",
    white: "bg-white",
    soft: "bg-gradient-to-b from-white to-neutral-50",
  };

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`scroll-mt-12 md:scroll-mt-14 py-12 md:py-16 lg:py-20 ${backgrounds[variant]} border-b border-neutral-900/10 ${className}`}
    >
      <div className={containerClass}>{children}</div>
    </motion.section>
  );
}
