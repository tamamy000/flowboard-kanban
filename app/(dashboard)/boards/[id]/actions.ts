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

export async function upsertCard(boardId: string, data: CardInput) {
  const supabase = await createClient();

  // Determine next position
  const { count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("column_id", data.columnId);

  const payload = {
    column_id: data.columnId,
    title: data.title,
    description: data.description ?? null,
    priority: data.priority ?? null,
    due_date: data.due_date ?? null,
    position: count ?? 0,
  };

  if (data.id) {
    const { error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", data.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("cards").insert(payload);
    if (error) throw error;
  }

  revalidatePath(`/boards/${boardId}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw error;
  revalidatePath(`/boards/${boardId}`);
}

export async function moveCard(
  boardId: string,
  cardId: string,
  targetColumnId: string
) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("column_id", targetColumnId);

  const { error } = await supabase
    .from("cards")
    .update({ column_id: targetColumnId, position: count ?? 0 })
    .eq("id", cardId);

  if (error) throw error;
  revalidatePath(`/boards/${boardId}`);
}
