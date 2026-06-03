"use client";

import { type FormEvent, useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ password: formData.get("password") }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = await response.json();

      if (response.ok) {
        setMessage("Login successful. Opening editor...");
        const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
        window.location.href = returnUrl || window.location.pathname;
        return;
      }

      setMessage(payload.message || "Wrong password.");
    } catch {
      setMessage("Login request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto grid max-w-md gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl"
    >
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">
          Team editor
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Enter password</h1>
      </div>
      <input
        className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold"
        name="password"
        placeholder="Password"
        required
        type="password"
        autoComplete="current-password"
      />
      <button className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white">
        {isLoading ? "Checking..." : "Continue"}
      </button>
      {message ? (
        <p
          className={`text-sm font-bold ${
            message.startsWith("Login successful") ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      ) : null}
      {process.env.NODE_ENV === "development" ? (
        <p className="rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-900">
          Default if `.env` is missing: password is <code>change-this-password</code>
        </p>
      ) : null}
    </form>
  );
}
