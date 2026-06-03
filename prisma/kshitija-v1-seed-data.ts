import { KSHITIJA_V1_DEFAULT_CONTENT } from "../src/templates/dietician/kshitija-v1/default-content";

/** Editor schema + default JSON for Dietician Template 1 (Kshitija) */
export const KSHITIJA_V1_SCHEMA = {
  sections: [
    {
      id: "brand",
      label: "Brand",
      fields: [
        { key: "name", type: "text", label: "Business name" },
        { key: "logoUrl", type: "image", label: "Logo" },
        { key: "calendlyUrl", type: "url", label: "Calendly URL" },
      ],
    },
    {
      id: "hero",
      label: "Hero",
      fields: [
        { key: "badgePrimary", type: "text", label: "Badge line 1" },
        { key: "badgeSecondary", type: "text", label: "Badge line 2" },
        { key: "headline", type: "text", label: "Headline" },
        { key: "headlineHighlight", type: "text", label: "Headline highlight" },
        { key: "subheading", type: "text", label: "Subheading start" },
        { key: "subheadingEmphasis", type: "text", label: "Subheading emphasis" },
        { key: "subheadingSuffix", type: "text", label: "Subheading end" },
        { key: "ctaLabel", type: "text", label: "CTA button" },
      ],
    },
    {
      id: "video",
      label: "Video & form",
      fields: [
        { key: "wistiaVideoId", type: "text", label: "Wistia video ID" },
        { key: "title", type: "text", label: "Section title" },
        { key: "highlight", type: "text", label: "Title highlight" },
        { key: "subtitle", type: "text", label: "Subtitle" },
        { key: "formTitle", type: "text", label: "Form title" },
      ],
    },
    {
      id: "benefits",
      label: "Benefits",
      fields: [{ key: "items", type: "array", label: "Benefit cards" }],
    },
    {
      id: "introduction",
      label: "About / Bio",
      fields: [
        { key: "highlight", type: "text", label: "Name highlight" },
        { key: "imageUrl", type: "image", label: "Bio image" },
        { key: "paragraphs", type: "array", label: "Bio paragraphs" },
      ],
    },
    {
      id: "reviews",
      label: "Testimonials",
      fields: [{ key: "images", type: "array", label: "Review images" }],
    },
    {
      id: "footer",
      label: "Footer",
      fields: [
        { key: "copyrightName", type: "text", label: "Copyright name" },
        { key: "tagline", type: "text", label: "Tagline" },
      ],
    },
    {
      id: "meta",
      label: "SEO",
      fields: [
        { key: "title", type: "text", label: "Page title" },
        { key: "description", type: "text", label: "Meta description" },
      ],
    },
  ],
};

export const KSHITIJA_V1_DEFAULT_CONTENT_JSON = KSHITIJA_V1_DEFAULT_CONTENT;
