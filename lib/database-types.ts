// Database type definitions for the VotoPhoto application
// These types correspond to the Supabase database schema

export interface Contest {
  id: string;
  created_at: string;
  title?: string;
  welcome_message?: string;
  user_id: string;
  votes_counted_at: string | null;
  contest_started_at: string | null;
  contest_ended_at: string | null;
}

export interface ContestCategory {
  contest_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  name: string;
  id: string;
}

export interface ContestSubmission {
  id: string;
  created_at: string;
  contest_id: string;
  title: string;
  user_id: string;
  description?: string;
  image_url: string;
}

export interface CategorySubmission {
  contest_category_id: string;
  contest_submission_id: string;
  created_at: string;
}

// Extended types for components that include related data

export interface SubmissionWithCategories extends ContestSubmission {
  category_submission?: Array<{
    contest_category?: {
      id: string;
      name: string;
    };
  }>;
  categories?: Array<{
    id: string;
    name: string;
  }>;
}

// Simplified types for form components

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface ExistingSubmission {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  categories?: string[]; // Array of category IDs
}
