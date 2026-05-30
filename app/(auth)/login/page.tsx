"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

type Tab = "signin" | "magic" | "signup";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();
  const emailId = useId();
  const passwordId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      if (tab === "signin") {
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

  function Spinner() {
    return (
      <svg
        className="animate-spin"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="2"
        />
        <path
          d="M8 2a6 6 0 0 1 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "signin", label: "Sign in" },
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
          <div className="bg-column-bg rounded-[10px] p-1 flex mb-6">
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
            <div className="flex flex-col gap-2">
              <label
                htmlFor={emailId}
                className="text-text text-sm font-medium leading-5 tracking-[-0.15px]"
              >
                Email Address
              </label>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-required="true"
                aria-invalid={!!error}
                className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
              />
            </div>

            {tab !== "magic" && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={passwordId}
                  className="text-text text-sm font-medium leading-5 tracking-[-0.15px]"
                >
                  Password
                </label>
                <input
                  id={passwordId}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-required="true"
                  aria-invalid={!!error}
                  className="border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 py-[10px] text-base text-text placeholder:text-muted outline-none focus:border-primary focus:bg-input-focus transition-colors"
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-delete text-sm leading-5">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-primary text-sm leading-5">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white text-base font-medium leading-6 tracking-[-0.31px] rounded-[10px] py-[10px] w-full hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending && <Spinner />}
              {isPending
                ? "Please wait…"
                : tab === "signin"
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
