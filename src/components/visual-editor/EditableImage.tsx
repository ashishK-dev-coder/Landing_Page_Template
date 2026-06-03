"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Camera, Loader2, Check, X } from "lucide-react";
import { useEditTarget } from "@/components/templates/EditTargetContext";
import { useEditMode } from "./EditModeContext";

type Props = {
  sectionId: string;
  field?: string;
  jsonPath?: string;
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: ReactNode;
};

type UploadStatus = "idle" | "uploading" | "done" | "error";

export function EditableImage({ sectionId, field, jsonPath, src, alt, className = "", fallback }: Props) {
  const { isEditMode, activeSection, applyPatch } = useEditMode();
  const editTarget = useEditTarget();
  const isActive = activeSection === sectionId;

  const [currentSrc, setCurrentSrc] = useState(src);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!isEditMode || !isActive) {
    return currentSrc ? (
      <img alt={alt} className={className} src={currentSrc} />
    ) : (
      <>{fallback}</>
    );
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus("idle");
    setErrorMsg("");
  }

  async function upload() {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.set("file", selectedFile);
      formData.set("sectionType", sectionId);
      if (field) formData.set("field", field);
      if (jsonPath) formData.set("jsonPath", jsonPath);
      if (editTarget?.mode === "template") formData.set("templateId", editTarget.templateId);
      if (editTarget?.mode === "site") formData.set("siteId", editTarget.siteId);

      const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Upload failed");

      setCurrentSrc(payload.url);
      applyPatch(jsonPath ?? `${sectionId}.${field}`, payload.url);
      setStatus("done");
      setTimeout(() => { setShowModal(false); setStatus("idle"); setPreview(null); setSelectedFile(null); }, 1000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function cancel() { setShowModal(false); setPreview(null); setSelectedFile(null); setStatus("idle"); setErrorMsg(""); }

  return (
    <>
      {/* Image with edit overlay */}
      <div className="group/img relative">
        {currentSrc ? (
          <img alt={alt} className={className} src={currentSrc} />
        ) : (
          <>{fallback}</>
        )}

        <button
          aria-label={`Replace ${alt} image`}
          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1.5 text-xs font-black text-white shadow-lg"
          onClick={() => setShowModal(true)}
          type="button"
        >
          <Camera className="h-3.5 w-3.5" />
          Replace
        </button>
      </div>

      {/* Upload modal — bottom sheet on mobile, centered on desktop */}
      {showModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:px-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancel(); }}
        >
          <div
            className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-[1.5rem]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Replace Image</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Uploading for: <strong>{alt}</strong>
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 active:bg-slate-200"
                  onClick={cancel}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drop zone / tap zone */}
              <div
                className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors active:bg-blue-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img alt="Preview" className="max-h-48 w-full rounded-xl object-contain" src={preview} />
                ) : (
                  <>
                    <Camera className="mb-2 h-10 w-10 text-slate-400" />
                    <p className="text-sm font-bold text-slate-600">Tap to choose image</p>
                    <p className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP · max 5MB</p>
                  </>
                )}
                <input accept="image/*" className="hidden" onChange={onFileChange} ref={fileInputRef} type="file" />
              </div>

              {errorMsg && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{errorMsg}</p>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-3 pb-safe">
                <button
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-black text-slate-700 active:bg-slate-50"
                  onClick={cancel}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-black text-white active:bg-blue-700 disabled:opacity-60"
                  disabled={!selectedFile || status === "uploading" || status === "done"}
                  onClick={upload}
                  type="button"
                >
                  {status === "uploading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === "done" && <Check className="h-4 w-4" />}
                  {status === "uploading" ? "Uploading…" : status === "done" ? "Saved!" : "Upload & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
