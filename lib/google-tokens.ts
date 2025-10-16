import { createClient } from "@/lib/supabase/server";

/**
 * Utility functions for handling Google OAuth tokens
 */

/**
 * Store Google tokens securely
 * In production, you should store these in a secure backend or encrypted storage
 */
export async function storeGoogleTokens(
  accessToken: string,
  refreshToken?: string,
  userId?: string
) {
  try {
    // Option 1: Store in Supabase user metadata (recommended for most cases)
    if (userId) {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          google_access_token: accessToken,
          google_refresh_token: refreshToken,
          google_token_updated_at: new Date().toISOString(),
        },
      });

      if (error) {
        console.error("Error storing tokens in user metadata:", error);
        return false;
      }
    }

    // Option 2: Store in a separate tokens table (for more complex use cases)
    // const supabase = await createClient()
    // await supabase.from('user_tokens').upsert({
    //   user_id: userId,
    //   provider: 'google',
    //   access_token: accessToken,
    //   refresh_token: refreshToken,
    //   updated_at: new Date().toISOString(),
    // })

    console.log("Google tokens stored successfully");
    return true;
  } catch (error) {
    console.error("Failed to store Google tokens:", error);
    return false;
  }
}

/**
 * Retrieve stored Google tokens for API calls
 */
export async function getGoogleTokens() {
  try {
    const supabase = await createClient();
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Error retrieving user:", error);
      return null;
    }

    return {
      accessToken: user.user.user_metadata?.google_access_token,
      refreshToken: user.user.user_metadata?.google_refresh_token,
      updatedAt: user.user.user_metadata?.google_token_updated_at,
    };
  } catch (error) {
    console.error("Failed to retrieve Google tokens:", error);
    return null;
  }
}

/**
 * Example function to make authenticated requests to Google APIs
 */
export async function makeGoogleAPIRequest(endpoint: string) {
  const tokens = await getGoogleTokens();

  if (!tokens?.accessToken) {
    throw new Error("No Google access token found");
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Google API request failed:", error);
    throw error;
  }
}

/**
 * Refresh Google access token using refresh token
 */
export async function refreshGoogleToken() {
  const tokens = await getGoogleTokens();

  if (!tokens?.refreshToken) {
    throw new Error("No Google refresh token found");
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: tokens.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Google token");
    }

    const data = await response.json();

    // Store the new access token (get current user for ID)
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (user?.user) {
      await storeGoogleTokens(
        data.access_token,
        tokens.refreshToken,
        user.user.id
      );
    }

    return data.access_token;
  } catch (error) {
    console.error("Failed to refresh Google token:", error);
    throw error;
  }
}
