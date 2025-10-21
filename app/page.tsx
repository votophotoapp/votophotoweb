import { Hero } from "@/components/marketing/hero";
import { AppHeader } from "@/components/app-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Camera, Vote } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <AppHeader showAuthButton={true} />
        <div className="flex-1 flex flex-col gap-12 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <section className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="font-medium text-2xl">What is VotoPhoto?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  VotoPhoto is a platform for hosting engaging photo contests.
                  Create contests, invite participants to submit their best
                  photos, and let participants vote on their favorites.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Create Contests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Set up photo contests with custom categories and rules.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Submit Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Participants can easily upload and share their
                      photography.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <Vote className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Vote & Decide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Participants can vote for their favorite submissions in
                      each category.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </section>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>Built with care in Roswell, GA</p>
        </footer>
      </div>
    </main>
  );
}
