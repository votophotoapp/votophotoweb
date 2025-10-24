"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { generateId } from "@/lib/id-generator";
import imageCompression from "browser-image-compression";
import { ExistingSubmission } from "@/lib/database-types";
import { submitPhoto } from "@/app/c/[contestId]/actions";

interface SubmitPhotoFormProps {
  contestId: string;
  existingSubmission?: ExistingSubmission;
}

export function SubmitPhotoForm({
  contestId,
  existingSubmission,
}: SubmitPhotoFormProps) {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const supabase = createClient();

  // Pre-populate form if editing existing submission
  useEffect(() => {
    if (existingSubmission) {
      setTitle(existingSubmission.title);
      setDescription(existingSubmission.description || "");
      setName(existingSubmission.display_name || "");
      setPreviewUrl(existingSubmission.image_url);
      setAcceptTerms(true); // Assume terms were accepted for existing submissions
    }
  }, [existingSubmission]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Image compression options
        const options = {
          maxSizeMB: 1, // Maximum file size in MB
          maxWidthOrHeight: 1920, // Maximum width or height
          useWebWorker: true, // Use web worker for better performance
          preserveExif: false, // Don't preserve EXIF data to reduce size
        };

        // Compress the image
        const compressedFile = await imageCompression(file, options);

        setSelectedFile(compressedFile);
        const url = URL.createObjectURL(compressedFile);
        setPreviewUrl(url);
      } catch {
        // Fallback to original file if compression fails
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !title ||
      !name ||
      !acceptTerms ||
      (!selectedFile && !existingSubmission) // Require file only for new submissions
    ) {
      alert("Please fill in all required fields and accept the terms.");
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      let {
        data: { user },
      } = await supabase.auth.getUser();

      // Sign in anonymously if not authenticated
      if (!user) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInAnonymously();
        if (signInError) {
          throw signInError;
        }
        user = signInData.user;
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      let imageUrl = existingSubmission?.image_url || "";

      // Upload file to Supabase Storage if a new file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${generateId(8)}.${fileExt}`;
        const filePath = `${contestId}/${fileName}`;

        console.log("Attempting upload to path:", filePath);

        const { error: uploadError } = await supabase.storage
          .from("contest_images")
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("contest_images").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Prepare form data for server action
      const formData = new FormData();
      formData.append("contestId", contestId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("displayName", name);
      formData.append("imageUrl", imageUrl);
      if (existingSubmission) {
        formData.append("existingSubmissionId", existingSubmission.id);
      }

      // Call server action
      const result = await submitPhoto(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to submit photo");
      }

      // Redirect back to appropriate page
      if (existingSubmission) {
        // Check if user is contest owner for redirect
        const { data: contestOwnerCheck } = await supabase
          .from("contest")
          .select("user_id")
          .eq("id", contestId)
          .eq("user_id", user.id)
          .single();

        const isContestOwner = !!contestOwnerCheck;
        router.push(
          isContestOwner ? `/manage/contests/${contestId}` : `/c/${contestId}`,
        );
      } else {
        router.push(`/c/${contestId}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingSubmission ? "Edit Photo" : "Photo Details"}
        </CardTitle>
        <CardDescription>
          {existingSubmission
            ? "Update the information for your photo submission."
            : "Fill in the information below to submit your photo to the contest."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="max-w-full max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isCompressing ? (
                    <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
                  ) : (
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  )}
                  {!isCompressing && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isCompressing}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        disabled={isCompressing}
                      >
                        <label htmlFor="photo" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {isCompressing ? "Optimizing..." : "Choose Photo"}
                        </label>
                      </Button>
                    </div>
                  )}
                  {isCompressing && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Optimizing image for faster upload...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              required
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Photo Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your photo a catchy title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Tell us about your photo (optional)"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I accept the{" "}
              <a href="/terms" className="text-primary hover:underline">
                terms and conditions
              </a>{" "}
              and confirm that I own the copyright to this photo
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              isCompressing ||
              (!selectedFile && !existingSubmission)
            }
          >
            {isCompressing
              ? "Optimizing..."
              : isLoading
                ? existingSubmission
                  ? "Updating..."
                  : "Submitting..."
                : existingSubmission
                  ? "Update Photo"
                  : "Submit Photo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
