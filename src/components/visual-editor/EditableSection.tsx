"use client";

import { type ReactNode } from "react";
import { Pencil, X } from "lucide-react";
import { useEditMode } from "./EditModeContext";

type Props = {
  sectionId: string;
  label: string;
  children: ReactNode;
};

export function EditableSection({ sectionId, label, children }: Props) {
  const { isEditMode, activeSection, openSection, closeSection } = useEditMode();
  const isActive = activeSection === sectionId;

  if (!isEditMode) return <>{children}</>;

  return (
    <div
      className={`group/section relative transition-all duration-200 ${
        isActive
          ? "outline outline-2 outline-offset-2 outline-blue-500"
          : "outline outline-1 outline-offset-2 outline-transparent hover:outline-blue-300"
      }`}
    >
      {/* Pencil — always visible in edit mode (hover-only broke on desktop: control was outside group/section) */}
      <div className="absolute left-2 top-2 z-[100] flex items-center gap-1.5">
        <span className="hidden rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg sm:inline">
          {label}
        </span>

        <button
          aria-label={isActive ? `Close ${label} editor` : `Edit ${label}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 sm:h-8 sm:w-8 ${
            isActive
              ? "bg-blue-600 text-white"
              : "bg-white/95 text-blue-600 ring-1 ring-blue-200"
          }`}
          onClick={() => (isActive ? closeSection() : openSection(sectionId))}
          type="button"
        >
          {isActive ? (
            <X className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </button>

        {isActive && (
          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg sm:hidden">
            {label}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}
