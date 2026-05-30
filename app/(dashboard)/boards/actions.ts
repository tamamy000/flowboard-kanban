"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBoard(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) throw error;

  // Seed default columns
  await supabase.from("columns").insert([
    { board_id: board.id, title: "To Do", position: 0 },
    { board_id: board.id, title: "In Progress", position: 1 },
    { board_id: board.id, title: "Done", position: 2 },
  ]);

  revalidatePath("/boards");
}
