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

export async function updateContestTitle(contestId: string, title: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  if (!title || title.trim() === "") {
    throw new Error("Contest title is required");
  }

  // Update the contest title, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({ title: title.trim() })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error("Failed to update contest title: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to edit it",
    );
  }

  // Revalidate the contest page to show the updated title
  revalidatePath(`/manage/contests/${contestId}`);

  return { success: true, data: data[0] };
}

export async function updateContestWelcomeMessage(
  contestId: string,
  welcomeMessage: string,
) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Update the contest welcome message, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({ welcome_message: welcomeMessage })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error(
      "Failed to update contest welcome message: " + error.message,
    );
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to edit it",
    );
  }

  // Revalidate the contest page to show the updated welcome message
  revalidatePath(`/manage/contests/${contestId}`);

  return { success: true, data: data[0] };
}

export async function deleteContest(contestId: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Delete the contest, but only if the user owns it
  const { error } = await supabase
    .from("contest")
    .delete()
    .eq("id", contestId)
    .eq("user_id", user.id); // Ensure user can only delete their own contests

  if (error) {
    throw new Error("Failed to delete contest: " + error.message);
  }

  // Revalidate the contests page to remove the deleted contest
  revalidatePath("/manage/contests");

  return { success: true };
}

export async function openSubmissions(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const contestId = formData.get("contestId") as string;

  if (!contestId) {
    throw new Error("Contest ID is required");
  }

  // Update the contest to set submissions_opened_at to now, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({
      submissions_opened_at: new Date().toISOString(),
      submissions_closed_at: null,
    })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error("Failed to open submissions: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to open submissions",
    );
  }

  // Revalidate the contest page to show the updated end date
  revalidatePath(`/manage/contests/${contestId}`);
}

export async function closeSubmissions(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const contestId = formData.get("contestId") as string;

  if (!contestId) {
    throw new Error("Contest ID is required");
  }

  // Update the contest to set submissions_closed_at to now, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({ submissions_closed_at: new Date().toISOString() })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error("Failed to close submissions: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to close submissions",
    );
  }

  // Revalidate the contest page to show the updated start date
  revalidatePath(`/manage/contests/${contestId}`);
}

export async function uncloseSubmissions(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const contestId = formData.get("contestId") as string;

  if (!contestId) {
    throw new Error("Contest ID is required");
  }

  // Update the contest to set submissions_closed_at to null, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({ submissions_closed_at: null })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error("Failed to reopen submissions: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to reopen submissions",
    );
  }

  // Revalidate the contest page to show the updated status
  revalidatePath(`/manage/contests/${contestId}`);
}

export async function revealWinners(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const contestId = formData.get("contestId") as string;

  if (!contestId) {
    throw new Error("Contest ID is required");
  }

  // Update the contest to set winners_revealed_at to now, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({ winners_revealed_at: new Date().toISOString() })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error("Failed to reveal winners: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to reveal winners",
    );
  }

  // Revalidate the contest page to show the winners
  revalidatePath(`/manage/contests/${contestId}`);
}

export async function hideWinners(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const contestId = formData.get("contestId") as string;

  if (!contestId) {
    throw new Error("Contest ID is required");
  }

  // Update the contest to set winners_revealed_at to null, but only if the user owns it
  const { data, error } = await supabase
    .from("contest")
    .update({ winners_revealed_at: null })
    .eq("id", contestId)
    .eq("user_id", user.id) // Ensure user can only update their own contests
    .select();

  if (error) {
    throw new Error("Failed to hide winners: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Contest not found or you don't have permission to hide winners",
    );
  }

  // Revalidate the contest page to hide the winners
  revalidatePath(`/manage/contests/${contestId}`);
}
