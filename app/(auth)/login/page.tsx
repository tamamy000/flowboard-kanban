"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

type Tab = "password" | "magic" | "signup";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      if (tab === "password") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.push("/boards");
          router.refresh();
        }
      } else if (tab === "magic") {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for the magic link!");
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          router.push("/boards");
          router.refresh();
        }
      }
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "password", label: "Password" },
    { key: "magic", label: "Magic link" },
    { key: "signup", label: "Sign up" },
  ];

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3">
          <Logo size={48} />
          <p className="text-text text-2xl font-semibold leading-8 tracking-[0.07px]">
            FlowBoard
          </p>
          <p className="text-muted text-sm leading-5 tracking-[-0.15px]">
            Sign in to manage your boards
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[16px] shadow-[0_10px_7.5px_rgba(0,0,0,0.1),0_4px_3px_rgba(0,0,0,0.1)] w-[448px] pt-8 px-8">
          {/* Tab toggle */}
          <div className="bg-column-bg rounded-[10px] p-1 flex gap-0 mb-6">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 py-2 px-6 rounded-[8px] text-sm font-medium leading-5 tracking-[-0.15px] transition-all ${
                  tab === key
                    ? "bg-white shadow-sm text-text"
                    : "text-muted hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-8">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-text text-sm font-medium leading-5 tracking-[-0.15px]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
              />
            </div>

            {/* Password (not shown for magic link) */}
            {tab !== "magic" && (
              <div className="flex flex-col gap-2">
                <label className="text-text text-sm font-medium leading-5 tracking-[-0.15px]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
                />
              </div>
            )}

            {/* Forgot password */}
            {tab === "password" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-primary text-sm leading-5 tracking-[-0.15px] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error / success */}
            {error && (
              <p className="text-delete text-sm leading-5">{error}</p>
            )}
            {message && (
              <p className="text-primary text-sm leading-5">{message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] py-[10px] w-full hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {isPending
                ? "Please wait…"
                : tab === "password"
                ? "Sign in"
                : tab === "magic"
                ? "Send magic link"
                : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
