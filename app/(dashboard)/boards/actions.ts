"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBoard(name: string) {
  const trimmedName = name?.trim() ?? "";
  if (!trimmedName) throw new Error("Board name is required");
  if (trimmedName.length > 100)
    throw new Error("Board name must be 100 characters or fewer");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ name: trimmedName, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error("Failed to create board");

  const { error: colError } = await supabase.from("columns").insert([
    { board_id: board.id, title: "To Do", position: 0 },
    { board_id: board.id, title: "In Progress", position: 1 },
    { board_id: board.id, title: "Done", position: 2 },
  ]);

  if (colError) throw new Error("Failed to initialize board columns");

  revalidatePath("/boards");
}
