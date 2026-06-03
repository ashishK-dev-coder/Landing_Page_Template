/**
 * Content shape is template-specific; stored as JSON in DB.
 * Master structure is defined in template_schemas.schema_json.
 */

export type ContentFieldType =
  | "text"
  | "richtext"
  | "image"
  | "url"
  | "color"
  | "array";

export interface SchemaField {
  key: string;
  type: ContentFieldType;
  label: string;
  required?: boolean;
  maxLength?: number;
}

export interface SchemaSection {
  id: string;
  label: string;
  fields: SchemaField[];
}

export interface TemplateSchemaJson {
  sections: SchemaSection[];
}

/** Example site content for dietician template */
export interface DieticianContentJson {
  hero: {
    heading: string;
    subheading: string;
    ctaText: string;
    bioImage: string;
  };
  about: {
    title: string;
    description: string;
  };
  testimonials: Array<{
    name: string;
    quote: string;
    image: string;
  }>;
  faq: Array<{ question: string; answer: string }>;
}

export type SiteContentJson = Record<string, unknown>;
