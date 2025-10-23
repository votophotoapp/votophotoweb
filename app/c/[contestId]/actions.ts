"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitVote(
  submissionId: string,
  categoryId: string,
  contestId: string,
) {
  console.log("submitVote called with:", {
    submissionId,
    categoryId,
    contestId,
  });

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("User:", user ? user.id : "not authenticated");

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user has already voted for this category in any submission
    const { data: existingVotes, error: checkError } = await supabase
      .from("contest_submission_vote")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("contest_category_id", categoryId);

    console.log("Existing votes for category:", existingVotes);

    if (checkError) {
      console.error("Check error:", checkError);
      throw checkError;
    }

    if (existingVotes && existingVotes.length > 0) {
      throw new Error(
        "You have already voted for this category in another submission",
      );
    }

    console.log("Inserting vote...");

    // Insert the vote
    const { error } = await supabase.from("contest_submission_vote").insert({
      user_id: user.id,
      contest_submission_id: submissionId,
      contest_category_id: categoryId,
    });

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    console.log("Vote inserted successfully");

    // Revalidate the contest page to update the UI
    revalidatePath(`/c/${contestId}`);

    return { success: true };
  } catch (error) {
    console.error("Error submitting vote:", error);
    console.error("Error type:", typeof error);
    console.error(
      "Error keys:",
      error && typeof error === "object" ? Object.keys(error) : "not an object",
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to submit vote";
    return { success: false, error: errorMessage };
  }
}

export async function removeVote(
  submissionId: string,
  categoryId: string,
  contestId: string,
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Remove the vote
    const { error } = await supabase
      .from("contest_submission_vote")
      .delete()
      .eq("user_id", user.id)
      .eq("contest_submission_id", submissionId)
      .eq("contest_category_id", categoryId);

    if (error) {
      throw error;
    }

    // Revalidate the contest page to update the UI
    revalidatePath(`/c/${contestId}`);

    return { success: true };
  } catch (error) {
    console.error("Error removing vote:", error);
    return { success: false, error: "Failed to remove vote" };
  }
}

export async function getUserVotes(submissionId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Set<string>();
    }

    // Fetch user's votes for this submission
    const { data, error } = await supabase
      .from("contest_submission_vote")
      .select("contest_category_id")
      .eq("user_id", user.id)
      .eq("contest_submission_id", submissionId);

    if (error) {
      console.error("Error fetching votes:", error);
      return new Set<string>();
    }

    return new Set(data?.map((vote) => vote.contest_category_id) || []);
  } catch (error) {
    console.error("Error fetching user votes:", error);
    return new Set<string>();
  }
}
