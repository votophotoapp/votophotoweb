// Database type definitions for the VotoPhoto application
// These types correspond to the Supabase database schema

export interface Contest {
  id: string;
  created_at: string;
  title?: string;
  welcome_message?: string;
  user_id: string;
  winners_revealed_at: string | null;
  submissions_opened_at: string | null;
  submissions_closed_at: string | null;
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
  display_name?: string;
  description?: string;
  image_url: string;
}

export interface ContestSubmissionVote {
  user_id: string;
  contest_submission_id: string;
  created_at: string;
  contest_category_id: string;
}

// Extended types for components that include related data

export interface ContestWithStats extends Contest {
  submissionCount: number;
  voteCount: number;
  photos: string[]; // Array of image URLs, up to 4
}

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
  display_name?: string;
}
