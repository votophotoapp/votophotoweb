import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCodeError() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">
              Authentication Error
            </CardTitle>
            <CardDescription>
              There was an error during the authentication process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                The OAuth authentication flow encountered an error. This could
                be due to:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>The authentication was cancelled</li>
                <li>Invalid or expired authorization code</li>
                <li>Network connectivity issues</li>
                <li>Configuration problems</li>
              </ul>
              <div className="flex flex-col gap-2 mt-4">
                <Button asChild>
                  <Link href="/">Try Again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
