import type { DieticianKshitijaContent } from "./types";

const CDN_BASE = "https://d1yei2z3i6k35z.cloudfront.net/13189876";

/** Master default content — matches Kshitija_Landing_Page; stored in DB via seed */
export const KSHITIJA_V1_DEFAULT_CONTENT: DieticianKshitijaContent = {
  brand: {
    name: "Wellness with Kshitija",
    logoUrl: "/templates/dietician/kshitija-v1/logo.avif",
    calendlyUrl: "https://calendly.com/wellnesswithkshitija/15mins",
  },
  nav: {
    links: [
      { href: "#hero", label: "Home" },
      { href: "#video", label: "Watch" },
      { href: "#benefits", label: "Benefits" },
      { href: "#reviews", label: "Reviews" },
    ],
    ctaLabel: "Book Free Call",
  },
  hero: {
    badgePrimary: "Trusted by women globally",
    badgeSecondary: "9+ years experience",
    headline: "Stay Active, Strong &",
    headlineHighlight: "Pain-Free",
    subheading: "A 100% personalized",
    subheadingEmphasis: "prenatal fitness program",
    subheadingSuffix:
      "designed for modern women who want a safe, guided, and confident pregnancy journey.",
    ctaLabel: "Book Your FREE 15 Min Call",
    ctaHref: "#video-form",
    stats: [
      { value: "9+", label: "Years coaching" },
      { value: "100%", label: "Personalized" },
      { value: "Free", label: "Strategy call" },
    ],
  },
  video: {
    eyebrow: "Introduction",
    title: "See how we help you move with",
    highlight: "confidence",
    subtitle:
      "A quick look at the safe, science-backed approach behind every personalized prenatal plan.",
    wistiaVideoId: "sobxlyaurk",
    videoCaption:
      "Tap play to learn how we tailor movement to your trimester, body, and goals.",
    formTitle: "Share your details",
    formSubtitle: "We will connect and guide you with the next step.",
    submitLabel: "Submit",
  },
  benefits: {
    eyebrow: "Free Strategy Call",
    title: "What we will uncover together in your",
    highlight: "free strategy call",
    subtitle:
      "Every session is tailored to your trimester, fitness level, and how your body feels today.",
    items: [
      {
        title: "Your Body, Your Trimester, Your Needs",
        desc: "We assess your current stage of pregnancy, fitness level, and any discomforts to understand exactly what your body needs right now.",
        icon: `${CDN_BASE}/69cb969ace8d92.92421679_Untitleddesign.png`,
      },
      {
        title: "Root Cause of Pain & Low Energy",
        desc: "Identify why you're experiencing back pain, pelvic discomfort, stiffness, or fatigue and how to fix it safely.",
        icon: `${CDN_BASE}/69cb970148aa48.81673015_Untitleddesign-2.png`,
      },
      {
        title: "What's Safe (and What to Avoid)",
        desc: "Get complete clarity on which movements are safe for you and your baby and what you should avoid to prevent risk.",
        icon: `${CDN_BASE}/691b2abe31993_2.png`,
      },
      {
        title: "Your Personalized Fitness Plan",
        desc: "Walk away with a clear, step-by-step roadmap to stay active, strong, and confident throughout your pregnancy.",
        icon: `${CDN_BASE}/69cb971003aac7.65149224_Untitleddesign-3.png`,
      },
    ],
  },
  introduction: {
    eyebrow: "Introduction",
    title: "Hi, I'm",
    highlight: "Kshitija",
    subtitle:
      "A Prenatal & Postnatal Fitness Specialist with 9+ years of experience helping women stay active, strong, and confident through pregnancy and beyond.",
    imageUrl: "/templates/dietician/kshitija-v1/introduction.jpg",
    imageAlt: "Kshitija introduction",
    paragraphs: [
      "I work closely with pregnant women and new mothers who want expert guidance to move safely, reduce pain, and build strength without risking their body or their baby.",
      "My approach is built around safe, scientific prenatal movement and practical strength—so you feel supported in every trimester and postpartum step.",
    ],
  },
  reviews: {
    eyebrow: "Client Stories",
    title: "Loved by Modern Mothers",
    highlight: "Everywhere",
    subtitle:
      "Real feedback from women who stayed active, strong, and confident through pregnancy.",
    images: [
      `${CDN_BASE}/6a15241cd72e51.68888212_KshitijaClientReviews.jpg.jpeg`,
      `${CDN_BASE}/6a1523e57e2c26.40945435_KshitijaClientReviews1.jpg.jpeg`,
      `${CDN_BASE}/6a152404980483.05455617_KshitijaClientReviews2.jpg.jpeg`,
    ],
    swipeHint: "Swipe to read more reviews →",
  },
  footer: {
    copyrightName: "Wellness with Kshitija",
    tagline: "Empowering women through safe and scientific prenatal movement.",
  },
  meta: {
    title: "Wellness with Kshitija | Prenatal Fitness",
    description:
      "A personalized prenatal fitness program for modern women. Stay active, strong, and pain-free throughout your pregnancy.",
  },
};
