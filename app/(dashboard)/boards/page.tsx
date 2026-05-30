import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BoardsClient from "./BoardsClient";

export default async function BoardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 bg-app-bg pt-8 px-8">
      <BoardsClient boards={boards ?? []} />
    </main>
  );
}
