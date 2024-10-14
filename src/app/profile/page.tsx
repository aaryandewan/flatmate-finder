// src/app/profile/page.tsx
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "@/lib/authOptions";

import { redirect } from "next/navigation"; // For redirecting users

export default async function Profile() {
  // Fetch the session server-side
  const session = await getServerSession(authOptions);

  // If no session, redirect to the home page
  if (!session) {
    redirect("/"); // Redirect to home page if not signed in
  }

  // Render the profile page if the user is signed in
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Your Profile</h1>
      <p>Welcome, {session.user?.email}</p>
    </div>
  );
}
