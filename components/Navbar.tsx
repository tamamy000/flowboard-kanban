"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

type NavbarProps = {
  variant?: "primary" | "secondary";
  boardName?: string;
  columnCount?: number;
  userInitial?: string;
};

export default function Navbar({
  variant = "primary",
  boardName,
  columnCount,
  userInitial = "U",
}: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (variant === "secondary") {
    return (
      <div className="border-b border-[rgba(0,0,0,0.1)] bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/boards"
            className="text-muted text-base font-medium hover:text-text transition-colors"
          >
            Boards
          </Link>
          <span className="text-muted text-base">/</span>
          <span className="text-text text-2xl font-medium leading-9">
            {boardName}
          </span>
          {columnCount !== undefined && (
            <span className="text-muted text-sm">
              {columnCount} column{columnCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-[rgba(0,0,0,0.1)] h-[65px] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-text text-base">FlowBoard</span>
        </div>
        <Link
          href="/boards"
          className="text-text text-base hover:text-primary transition-colors"
        >
          Boards
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-avatar w-6 h-6 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {userInitial}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-text text-base font-medium hover:text-muted transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
