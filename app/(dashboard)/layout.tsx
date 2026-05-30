import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const initial = (user.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userInitial={initial} />
      {children}
    </div>
  );
}
