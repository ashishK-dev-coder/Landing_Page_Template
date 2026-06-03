"use client";

import { useState } from "react";
import { EditableSection, EditableText } from "@/components/visual-editor";
import FadeIn from "../ui/FadeIn";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import type { DieticianKshitijaContent } from "../types";

type LeadForm = {
  name: string;
  age: string;
  phone: string;
  city: string;
  profile: "Working professional" | "Home maker" | "Other" | "";
};

const DEFAULT_FORM: LeadForm = {
  name: "",
  age: "",
  phone: "",
  city: "",
  profile: "",
};

export default function VideoSection({
  content,
  siteSlug,
}: {
  content: DieticianKshitijaContent["video"];
  siteSlug?: string;
}) {
  const [form, setForm] = useState<LeadForm>(DEFAULT_FORM);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");

  async function onSubmitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.age.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.profile
    ) {
      setFormStatus("error");
      setFormMessage("Please fill all fields.");
      return;
    }

    setFormStatus("submitting");
    setFormMessage("");

    if (!siteSlug) {
      setFormStatus("success");
      setFormMessage("Preview mode — form not submitted.");
      setForm(DEFAULT_FORM);
      return;
    }

    try {
      const res = await fetch(`/api/sites/${siteSlug}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "vsl-form" }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setFormStatus("success");
      setFormMessage("Thank you! We will be in touch.");
      setForm(DEFAULT_FORM);
    } catch {
      setFormStatus("error");
      setFormMessage("Could not submit right now. Please try again.");
    }
  }

  return (
    <EditableSection sectionId="video" label="Video & Form">
      <Section id="video" variant="light" containerClass="max-w-5xl mx-auto px-4 md:px-6">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        highlight={content.highlight}
        subtitle={content.subtitle}
      />

      <FadeIn delay={0.1}>
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl aspect-video bg-neutral-900 ring-4 md:ring-8 ring-white">
          <iframe
            src={`https://fast.wistia.net/embed/iframe/${content.wistiaVideoId}?videoFoam=true`}
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Introduction video"
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className="text-center text-xs md:text-sm text-neutral-500 mt-4 md:mt-5 max-w-md mx-auto">
          {content.videoCaption}
        </p>
      </FadeIn>

      <div className="mt-8">
        <FadeIn delay={0.3}>
          <form
            onSubmit={onSubmitLead}
            id="video-form"
            className="rounded-2xl bg-white shadow-sm border border-neutral-200 px-5 py-6 md:px-8 md:py-7"
          >
            <h3 className="text-lg md:text-xl font-semibold text-neutral-900 text-center">
              <EditableText
                sectionId="video"
                save={{ type: "json", path: "video.formTitle" }}
                value={content.formTitle}
              />
            </h3>
            <p className="text-sm text-neutral-600 text-center mt-1">
              <EditableText
                sectionId="video"
                save={{ type: "json", path: "video.formSubtitle" }}
                value={content.formSubtitle}
              />
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {(
                [
                  ["name", "Name", "text", "Your name"],
                  ["age", "Age", "number", "Age"],
                  ["phone", "Number", "tel", "Phone number"],
                  ["city", "City", "text", "Your city"],
                ] as const
              ).map(([key, label, type, placeholder]) => (
                <label key={key} className="block">
                  <span className="text-sm font-medium text-neutral-800">{label}</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-brand/30"
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>

            <label className="block mt-4">
              <span className="text-sm font-medium text-neutral-800">
                What describes you best?
              </span>
              <select
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-brand/30"
                value={form.profile}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    profile: e.target.value as LeadForm["profile"],
                  }))
                }
              >
                <option value="">Select one option</option>
                <option value="Working professional">Working professional</option>
                <option value="Home maker">Home maker</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={formStatus === "submitting"}
              className="mt-6 w-full rounded-xl bg-brand-dark text-white font-semibold py-3 hover:opacity-95 disabled:opacity-70"
            >
              {formStatus === "submitting" ? "Submitting..." : content.submitLabel}
            </button>

            {formMessage ? (
              <p
                className={`mt-3 text-sm text-center ${
                  formStatus === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formMessage}
              </p>
            ) : null}
          </form>
        </FadeIn>
      </div>
    </Section>
    </EditableSection>
  );
}
