export type NavLink = { href: string; label: string };

export type StatItem = { value: string; label: string };

export type BenefitItem = {
  title: string;
  desc: string;
  icon: string;
};

export type DieticianKshitijaContent = {
  brand: {
    name: string;
    logoUrl: string;
    calendlyUrl: string;
  };
  nav: {
    links: NavLink[];
    ctaLabel: string;
  };
  hero: {
    badgePrimary: string;
    badgeSecondary: string;
    headline: string;
    headlineHighlight: string;
    subheading: string;
    subheadingEmphasis: string;
    subheadingSuffix: string;
    ctaLabel: string;
    ctaHref: string;
    stats: StatItem[];
  };
  video: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    wistiaVideoId: string;
    videoCaption: string;
    formTitle: string;
    formSubtitle: string;
    submitLabel: string;
  };
  benefits: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    items: BenefitItem[];
  };
  introduction: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    paragraphs: string[];
  };
  reviews: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    images: string[];
    swipeHint: string;
  };
  footer: {
    copyrightName: string;
    tagline: string;
  };
  meta: {
    title: string;
    description: string;
  };
};
