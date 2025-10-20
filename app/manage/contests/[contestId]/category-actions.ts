"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateCategoryId } from "@/lib/id-generator";

export interface ContestCategory {
  contest_id: string;
  category_id: string;
  sort_order: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export async function getContestCategories(contestId: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // First verify that the user owns the contest
  const { data: contestData, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .eq("user_id", user.id)
    .single();

  if (contestError || !contestData) {
    throw new Error(
      "Contest not found or you don't have permission to access it"
    );
  }

  // Get categories for this contest, ordered by sort_order
  const { data, error } = await supabase
    .from("contest_category")
    .select("*")
    .eq("contest_id", contestId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch categories: " + error.message);
  }

  return { success: true, data: data || [] };
}

export async function createContestCategory(
  contestId: string,
  name: string,
  sortOrder: number
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

  if (!name || name.trim() === "") {
    throw new Error("Category name is required");
  }

  // First verify that the user owns the contest
  const { data: contestData, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .eq("user_id", user.id)
    .single();

  if (contestError || !contestData) {
    throw new Error(
      "Contest not found or you don't have permission to edit it"
    );
  }

  // Check if a category with this name already exists for this contest
  const { data: existingCategory, error: existingError } = await supabase
    .from("contest_category")
    .select("category_id")
    .eq("contest_id", contestId)
    .ilike("name", name.trim())
    .single();

  if (existingError && existingError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new Error(
      "Failed to check for existing category: " + existingError.message
    );
  }

  if (existingCategory) {
    throw new Error("A category with this name already exists");
  }

  // Generate a unique category_id
  const categoryId = generateCategoryId();

  const { data, error } = await supabase
    .from("contest_category")
    .insert([
      {
        contest_id: contestId,
        category_id: categoryId,
        name: name.trim(),
        sort_order: sortOrder,
      },
    ])
    .select();

  if (error) {
    throw new Error("Failed to create category: " + error.message);
  }

  // Revalidate the contest page
  revalidatePath(`/manage/contests/${contestId}`);

  return { success: true, data: data[0] };
}

export async function updateContestCategory(
  contestId: string,
  categoryId: string,
  updates: { name?: string; sort_order?: number }
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

  // First verify that the user owns the contest
  const { data: contestData, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .eq("user_id", user.id)
    .single();

  if (contestError || !contestData) {
    throw new Error(
      "Contest not found or you don't have permission to edit it"
    );
  }

  // If updating name, check for duplicates
  if (updates.name) {
    const trimmedName = updates.name.trim();
    if (!trimmedName) {
      throw new Error("Category name cannot be empty");
    }

    const { data: existingCategory, error: existingError } = await supabase
      .from("contest_category")
      .select("category_id")
      .eq("contest_id", contestId)
      .ilike("name", trimmedName)
      .neq("category_id", categoryId)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      throw new Error(
        "Failed to check for existing category: " + existingError.message
      );
    }

    if (existingCategory) {
      throw new Error("A category with this name already exists");
    }

    updates.name = trimmedName;
  }

  const { data, error } = await supabase
    .from("contest_category")
    .update(updates)
    .eq("contest_id", contestId)
    .eq("category_id", categoryId)
    .select();

  if (error) {
    throw new Error("Failed to update category: " + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Category not found");
  }

  // Revalidate the contest page
  revalidatePath(`/manage/contests/${contestId}`);

  return { success: true, data: data[0] };
}

export async function deleteContestCategory(
  contestId: string,
  categoryId: string
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

  // First verify that the user owns the contest
  const { data: contestData, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .eq("user_id", user.id)
    .single();

  if (contestError || !contestData) {
    throw new Error(
      "Contest not found or you don't have permission to edit it"
    );
  }

  // Delete the category
  const { error } = await supabase
    .from("contest_category")
    .delete()
    .eq("contest_id", contestId)
    .eq("category_id", categoryId);

  if (error) {
    throw new Error("Failed to delete category: " + error.message);
  }

  // Revalidate the contest page
  revalidatePath(`/manage/contests/${contestId}`);

  return { success: true };
}

export async function reorderContestCategories(
  contestId: string,
  categoryUpdates: { category_id: string; sort_order: number }[]
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

  // First verify that the user owns the contest
  const { data: contestData, error: contestError } = await supabase
    .from("contest")
    .select("id")
    .eq("id", contestId)
    .eq("user_id", user.id)
    .single();

  if (contestError || !contestData) {
    throw new Error(
      "Contest not found or you don't have permission to edit it"
    );
  }

  // Update sort orders for all categories
  const updates = categoryUpdates.map(async (update) => {
    return supabase
      .from("contest_category")
      .update({ sort_order: update.sort_order })
      .eq("contest_id", contestId)
      .eq("category_id", update.category_id);
  });

  const results = await Promise.all(updates);

  // Check if any updates failed
  const failedUpdate = results.find((result) => result.error);
  if (failedUpdate) {
    throw new Error(
      "Failed to reorder categories: " + failedUpdate.error?.message
    );
  }

  // Revalidate the contest page
  revalidatePath(`/manage/contests/${contestId}`);

  return { success: true };
}
