import { PrismaClient, RecordStatus } from "@prisma/client";
import {
  KSHITIJA_V1_DEFAULT_CONTENT_JSON,
  KSHITIJA_V1_SCHEMA,
} from "./kshitija-v1-seed-data";

const prisma = new PrismaClient();

const PLACEHOLDER_DIETICIAN_SCHEMA = {
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        { key: "heading", type: "text", label: "Headline", required: true },
        { key: "subheading", type: "text", label: "Subheadline" },
        { key: "ctaText", type: "text", label: "Button text" },
        { key: "bioImage", type: "image", label: "Bio image" },
      ],
    },
    {
      id: "about",
      label: "About",
      fields: [
        { key: "title", type: "text", label: "Title" },
        { key: "description", type: "richtext", label: "Description" },
      ],
    },
    {
      id: "testimonials",
      label: "Testimonials",
      fields: [
        {
          key: "items",
          type: "array",
          label: "Testimonials",
        },
      ],
    },
    {
      id: "faq",
      label: "FAQ",
      fields: [{ key: "items", type: "array", label: "FAQ items" }],
    },
  ],
};

const PLACEHOLDER_DIETICIAN_DEFAULT_CONTENT = {
  hero: {
    heading: "Transform Your Health Naturally",
    subheading: "Personalized nutrition plans by a certified dietician",
    ctaText: "Book Free Consultation",
    bioImage: "/placeholders/bio.jpg",
  },
  about: {
    title: "About Me",
    description: "10+ years helping clients achieve sustainable results.",
  },
  testimonials: {
    items: [
      {
        name: "Client A",
        quote: "Life-changing guidance!",
        image: "/placeholders/testimonial-1.jpg",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How long is the program?",
        answer: "Programs are tailored; typically 8–12 weeks.",
      },
    ],
  },
};

async function main() {
  console.log("Seeding Landing Page Template platform…");

  const starter = await prisma.plan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "Starter",
      slug: "starter",
      description: "Single-page landing for small businesses",
      priceInPaise: 59900,
      gstPercent: 18,
      features: ["1 landing page", "Subdomain hosting", "5 template choices per category"],
      sortOrder: 1,
      status: RecordStatus.ACTIVE,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "lead-generation" },
    update: {},
    create: {
      name: "Lead Generation",
      slug: "lead-generation",
      description: "Forms, CTAs, and conversion sections",
      priceInPaise: 0,
      sortOrder: 2,
      status: RecordStatus.INACTIVE,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "premium" },
    update: {},
    create: {
      name: "Premium",
      slug: "premium",
      description: "Full funnel and advanced sections",
      priceInPaise: 0,
      sortOrder: 3,
      status: RecordStatus.INACTIVE,
    },
  });

  const dietician = await prisma.category.upsert({
    where: { planId_slug: { planId: starter.id, slug: "dietician" } },
    update: {},
    create: {
      planId: starter.id,
      name: "Dietician",
      slug: "dietician",
      description: "Nutrition & wellness coaches",
      sortOrder: 1,
      status: RecordStatus.ACTIVE,
    },
  });

  const themeSlugs = [
    { name: "Green", slug: "green", primary: "#16a34a" },
    { name: "Blue", slug: "blue", primary: "#2563eb" },
    { name: "Purple", slug: "purple", primary: "#7c3aed" },
    { name: "Orange", slug: "orange", primary: "#ea580c" },
    { name: "Teal", slug: "teal", primary: "#0d9488" },
  ];

  const themes = [];
  for (let i = 0; i < themeSlugs.length; i++) {
    const t = themeSlugs[i];
    const theme = await prisma.theme.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        name: t.name,
        slug: t.slug,
        primaryColor: t.primary,
        sortOrder: i + 1,
        status: RecordStatus.ACTIVE,
      },
    });
    themes.push(theme);

    for (let c = 1; c <= 10; c++) {
      await prisma.themeCombination.upsert({
        where: {
          themeId_combinationIndex: { themeId: theme.id, combinationIndex: c },
        },
        update: {},
        create: {
          themeId: theme.id,
          name: `${t.name} — Combination ${c}`,
          combinationIndex: c,
          tokensJson: {
            primary: t.primary,
            secondary: adjustLightness(t.primary, 0.15),
            accent: adjustLightness(t.primary, -0.1),
            radius: c <= 3 ? "0.5rem" : c <= 7 ? "0.75rem" : "1rem",
            fontWeightHeading: c % 2 === 0 ? 700 : 600,
          },
        },
      });
    }
  }

  for (let n = 1; n <= 5; n++) {
    const slug = `template-${n}`;
    const isKshitija = n === 1;

    const template = await prisma.template.upsert({
      where: { categoryId_slug: { categoryId: dietician.id, slug } },
      update: {
        name: isKshitija ? "Dietician — Kshitija (Prenatal)" : `Dietician Template ${n}`,
        componentKey: isKshitija ? "dietician-kshitija-v1" : `dietician-template-${n}`,
        previewPath: `/preview/starter/dietician/${slug}`,
        thumbnailUrl: isKshitija
          ? "/templates/dietician/kshitija-v1/introduction.jpg"
          : `/thumbnails/dietician-${n}.jpg`,
      },
      create: {
        categoryId: dietician.id,
        name: isKshitija ? "Dietician — Kshitija (Prenatal)" : `Dietician Template ${n}`,
        slug,
        componentKey: isKshitija ? "dietician-kshitija-v1" : `dietician-template-${n}`,
        previewPath: `/preview/starter/dietician/${slug}`,
        thumbnailUrl: isKshitija
          ? "/templates/dietician/kshitija-v1/introduction.jpg"
          : `/thumbnails/dietician-${n}.jpg`,
        sortOrder: n,
        status: RecordStatus.ACTIVE,
      },
    });

    const schemaJson = isKshitija ? KSHITIJA_V1_SCHEMA : PLACEHOLDER_DIETICIAN_SCHEMA;
    const defaultContentJson = isKshitija
      ? KSHITIJA_V1_DEFAULT_CONTENT_JSON
      : {
          ...PLACEHOLDER_DIETICIAN_DEFAULT_CONTENT,
          hero: {
            ...PLACEHOLDER_DIETICIAN_DEFAULT_CONTENT.hero,
            heading: `Dietician Template ${n} — Sample Headline`,
          },
        };

    await prisma.templateSchema.upsert({
      where: { templateId: template.id },
      update: { schemaJson, defaultContentJson },
      create: { templateId: template.id, schemaJson, defaultContentJson },
    });

    for (const theme of themes) {
      await prisma.templateThemeAllowlist.upsert({
        where: { templateId_themeId: { templateId: template.id, themeId: theme.id } },
        update: {},
        create: { templateId: template.id, themeId: theme.id },
      });
    }
  }

  await prisma.teamMember.upsert({
    where: { email: "team@youragency.com" },
    update: {},
    create: {
      email: "team@youragency.com",
      name: "Agency Editor",
      role: "ADMIN",
      status: RecordStatus.ACTIVE,
    },
  });

  console.log("Seed complete: Starter plan, Dietician category, 5 templates, 5 themes × 10 combinations.");
}

function adjustLightness(hex: string, amount: number): string {
  return hex;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
