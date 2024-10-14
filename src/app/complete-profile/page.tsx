"use client";
import * as React from "react";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "@/lib/authOptions";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
// import { useToast } from "@/components/ui/use-toast"
import { useToast } from "@/hooks/use-toast";

import { Loader2 } from "lucide-react";

// export default async function CompleteProfile() {
//   // Fetch the session server-side to avoid flickering
//   const session = await getServerSession(authOptions);

//   // If the profile is complete, redirect the user to the /posts page
//   if (session?.user?.isProfileComplete) {
//     redirect("/posts");
//   }

//   // Now render the profile completion form if the profile is not complete
//   return <CompleteProfileForm session={session} />;
// }

export default function CompleteProfileForm() {
  const { data: session } = useSession();

  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [location, setLocation] = useState("");
  const [expectedRent, setExpectedRent] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session && session.user.isProfileComplete) {
      router.push("/posts");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.put(`/api/users/${session?.user?.id}`, {
        name,
        gender,
        location,
        expectedRent: Number(expectedRent),
        isProfileComplete: true,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully completed.",
      });

      router.push("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide the following information to complete your profile.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedRent">Expected Rent</Label>
              <Input
                id="expectedRent"
                type="number"
                value={expectedRent}
                onChange={(e) =>
                  setExpectedRent(
                    e.target.value ? parseInt(e.target.value) : ""
                  )
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster />
    </div>
  );
}
