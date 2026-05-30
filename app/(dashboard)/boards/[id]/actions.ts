"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CardInput = {
  id?: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
};

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateCardInput(data: CardInput): string {
  const title = data.title?.trim() ?? "";
  if (!title) throw new Error("Title is required");
  if (title.length > 200) throw new Error("Title must be 200 characters or fewer");
  if (data.description && data.description.length > 5000)
    throw new Error("Description must be 5000 characters or fewer");
  if (data.priority && !VALID_PRIORITIES.has(data.priority))
    throw new Error("Invalid priority value");
  if (data.due_date && !DATE_RE.test(data.due_date))
    throw new Error("Invalid due date");
  return title;
}

export async function upsertCard(boardId: string, data: CardInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = validateCardInput(data);

  // Verify the target column is owned by the current user (RLS also enforces this — defense in depth)
  const { data: col } = await supabase
    .from("columns")
    .select("id, board_id")
    .eq("id", data.columnId)
    .single();
  if (!col) throw new Error("Column not found");

  const { count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("column_id", data.columnId);

  const payload = {
    column_id: data.columnId,
    title,
    description: data.description?.trim() || null,
    priority: data.priority || null,
    due_date: data.due_date || null,
    position: count ?? 0,
  };

  if (data.id) {
    const { error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", data.id);
    if (error) throw new Error("Failed to save card");
  } else {
    const { error } = await supabase.from("cards").insert(payload);
    if (error) throw new Error("Failed to create card");
  }

  revalidatePath(`/boards/${col.board_id}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw new Error("Failed to delete card");

  revalidatePath(`/boards/${boardId}`);
}

export async function moveCard(
  boardId: string,
  cardId: string,
  targetColumnId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify the target column is owned by this user (defense in depth — RLS WITH CHECK also enforces this)
  const { data: targetCol } = await supabase
    .from("columns")
    .select("id, board_id")
    .eq("id", targetColumnId)
    .single();
  if (!targetCol) throw new Error("Target column not found");

  const { count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("column_id", targetColumnId);

  const { error } = await supabase
    .from("cards")
    .update({ column_id: targetColumnId, position: count ?? 0 })
    .eq("id", cardId);

  if (error) throw new Error("Failed to move card");

  revalidatePath(`/boards/${targetCol.board_id}`);
}
