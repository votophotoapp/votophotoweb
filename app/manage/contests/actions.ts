"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateContestId } from "@/lib/id-generator";

export async function createContest(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const title = formData.get("title") as string;

  if (!title || title.trim() === "") {
    throw new Error("Contest title is required");
  }

  // Generate a short, unique ID for the contest
  const contestId = generateContestId();

  const { data, error } = await supabase
    .from("contest")
    .insert([
      {
        id: contestId,
        title: title.trim(),
        user_id: user.id,
      },
    ])
    .select();

  if (error) {
    throw new Error("Failed to create contest: " + error.message);
  }

  // Revalidate the contests page to show the new contest
  revalidatePath("/manage/contests");

  return { success: true, data };
}
