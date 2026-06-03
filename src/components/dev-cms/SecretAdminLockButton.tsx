"use client";

import { Lock, X } from "lucide-react";
import { useState } from "react";
import { LoginForm } from "@/components/dev-cms/LoginForm";

export function SecretAdminLockButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Open admin login"
        className="fixed bottom-24 left-4 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-950 text-amber-300 shadow-2xl shadow-slate-950/30 transition-all hover:-translate-y-1 hover:bg-slate-800"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Lock className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            <button
              aria-label="Close admin login"
              className="absolute -right-3 -top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
            <LoginForm />
          </div>
        </div>
      ) : null}
    </>
  );
}
