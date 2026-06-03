import type { ComponentType } from "react";
import DieticianKshitijaTemplate, {
  type TemplateRenderProps,
} from "./dietician/kshitija-v1";
import { KSHITIJA_V1_DEFAULT_CONTENT } from "./dietician/kshitija-v1/default-content";
import type { DieticianKshitijaContent } from "./dietician/kshitija-v1/types";

export const TEMPLATE_COMPONENT_KEYS = {
  DIETICIAN_KSHITIJA_V1: "dietician-kshitija-v1",
} as const;

export type TemplateComponentKey =
  (typeof TEMPLATE_COMPONENT_KEYS)[keyof typeof TEMPLATE_COMPONENT_KEYS];

type TemplateEntry = {
  component: ComponentType<TemplateRenderProps>;
  parseContent: (raw: unknown) => DieticianKshitijaContent;
  defaultContent: DieticianKshitijaContent;
};

function parseKshitijaContent(raw: unknown): DieticianKshitijaContent {
  if (!raw || typeof raw !== "object") {
    return KSHITIJA_V1_DEFAULT_CONTENT;
  }
  return { ...KSHITIJA_V1_DEFAULT_CONTENT, ...(raw as Partial<DieticianKshitijaContent>) };
}

export const TEMPLATE_REGISTRY: Record<string, TemplateEntry> = {
  [TEMPLATE_COMPONENT_KEYS.DIETICIAN_KSHITIJA_V1]: {
    component: DieticianKshitijaTemplate,
    parseContent: parseKshitijaContent,
    defaultContent: KSHITIJA_V1_DEFAULT_CONTENT,
  },
};

export function getTemplateEntry(componentKey: string) {
  return TEMPLATE_REGISTRY[componentKey] ?? null;
}

export function renderTemplateProps(
  componentKey: string,
  contentJson: unknown,
  options?: {
    siteSlug?: string;
    primaryColor?: string | null;
    tokens?: Record<string, string | number> | null;
  }
): TemplateRenderProps | null {
  const entry = getTemplateEntry(componentKey);
  if (!entry) return null;

  return {
    content: entry.parseContent(contentJson),
    siteSlug: options?.siteSlug,
    theme: {
      primaryColor: options?.primaryColor,
      tokens: options?.tokens,
    },
  };
}
