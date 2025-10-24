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

export async function submitPhoto(formData: FormData) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentUser = user;

    if (!currentUser) {
      // Sign in anonymously if not authenticated
      const { data: signInData, error: signInError } =
        await supabase.auth.signInAnonymously();
      if (signInError) {
        throw signInError;
      }
      currentUser = signInData.user;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
    }

    const contestId = formData.get("contestId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const displayName = formData.get("displayName") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const existingSubmissionId = formData.get("existingSubmissionId") as
      | string
      | null;

    if (!contestId || !title || !displayName || !imageUrl) {
      throw new Error("Missing required fields");
    }

    if (existingSubmissionId) {
      // First verify the submission exists and belongs to this contest
      const { data: existingCheck, error: checkError } = await supabase
        .from("contest_submission")
        .select("id, contest_id, user_id")
        .eq("id", existingSubmissionId)
        .eq("contest_id", contestId)
        .single();

      if (checkError || !existingCheck) {
        throw new Error(
          "Submission not found or does not belong to this contest",
        );
      }

      // Check if user is the contest owner (manager) for update permissions
      const { data: contestOwnerCheck } = await supabase
        .from("contest")
        .select("user_id")
        .eq("id", contestId)
        .eq("user_id", currentUser.id)
        .single();

      const isContestOwner = !!contestOwnerCheck;

      // Update existing submission - owners can update any submission, regular users can only update their own
      let updateQuery = supabase
        .from("contest_submission")
        .update({
          title,
          description,
          image_url: imageUrl,
          display_name: displayName.trim() || null,
        })
        .eq("id", existingSubmissionId)
        .eq("contest_id", contestId); // Add contest_id filter for security

      if (!isContestOwner) {
        updateQuery = updateQuery.eq("user_id", currentUser.id);
      }

      const { error: dbError } = await updateQuery;

      if (dbError) {
        throw dbError;
      }
    } else {
      // Create new submission
      const { error: dbError } = await supabase
        .from("contest_submission")
        .insert({
          contest_id: contestId,
          title,
          description,
          image_url: imageUrl,
          user_id: currentUser.id,
          display_name: displayName.trim() || null,
        });

      if (dbError) {
        throw dbError;
      }
    }

    // Revalidate the contest page to show the new submission
    revalidatePath(`/c/${contestId}`);

    return { success: true };
  } catch (error) {
    console.error("Error submitting photo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit photo";
    return { success: false, error: errorMessage };
  }
}
