import { EditableSection, EditableText } from "@/components/visual-editor";
import FadeIn from "./ui/FadeIn";
import type { DieticianKshitijaContent } from "./types";

export default function Footer({ content }: { content: DieticianKshitijaContent["footer"] }) {
  return (
    <EditableSection sectionId="footer" label="Footer">
      <footer className="bg-white py-8 md:py-12 border-t border-neutral-100 mt-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <FadeIn>
            <p className="text-neutral-400 font-medium text-xs md:text-sm uppercase tracking-widest">
              ©{" "}
              <EditableText
                sectionId="footer"
                save={{ type: "json", path: "footer.copyrightName" }}
                value={content.copyrightName}
                className="text-neutral-900 font-bold"
              />
            </p>
            <p className="mt-1.5 text-neutral-400 text-xs">
              <EditableText
                sectionId="footer"
                save={{ type: "json", path: "footer.tagline" }}
                value={content.tagline}
              />
            </p>
          </FadeIn>
        </div>
      </footer>
    </EditableSection>
  );
}
