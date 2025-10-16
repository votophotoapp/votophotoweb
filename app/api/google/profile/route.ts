import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleTokens, refreshGoogleToken } from "@/lib/google-tokens";

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stored Google tokens
    const tokens = await getGoogleTokens();

    if (!tokens?.accessToken) {
      return NextResponse.json(
        { error: "No Google access token found. Please sign in with Google." },
        { status: 400 }
      );
    }

    try {
      // Make request to Google People API to get profile info
      const response = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        // Token might be expired, try to refresh
        try {
          const newAccessToken = await refreshGoogleToken();

          // Retry with new token
          const retryResponse = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!retryResponse.ok) {
            throw new Error("Failed to fetch profile after token refresh");
          }

          const profileData = await retryResponse.json();
          return NextResponse.json(profileData);
        } catch {
          return NextResponse.json(
            {
              error:
                "Token expired and refresh failed. Please sign in again with Google.",
            },
            { status: 401 }
          );
        }
      }

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const profileData = await response.json();
      return NextResponse.json(profileData);
    } catch (apiError) {
      console.error("Google API request failed:", apiError);
      return NextResponse.json(
        { error: "Failed to fetch Google profile data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
