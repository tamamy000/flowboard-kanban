import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import BoardClient from "./BoardClient";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: board } = await supabase
    .from("boards")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!board) notFound();

  const { data: columns } = await supabase
    .from("columns")
    .select("id, title, position")
    .eq("board_id", id)
    .order("position");

  const { data: cards } = await supabase
    .from("cards")
    .select("id, column_id, title, description, priority, due_date, position")
    .in("column_id", (columns ?? []).map((c) => c.id))
    .order("position");

  const columnsWithCards = (columns ?? []).map((col) => ({
    ...col,
    cards: (cards ?? []).filter((c) => c.column_id === col.id),
  }));

  return (
    <>
      <Navbar
        variant="secondary"
        boardName={board.name}
        columnCount={columns?.length ?? 0}
      />
      <main className="flex-1 bg-white pt-6 px-8 overflow-x-auto">
        <BoardClient boardId={id} columns={columnsWithCards} />
      </main>
    </>
  );
}
