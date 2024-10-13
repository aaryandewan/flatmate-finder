// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HomeClient from "./components/HomeClient";
import { redirect } from "next/navigation";

export default async function Home() {
  // Fetch the session server-side to avoid flickering
  const session = await getServerSession(authOptions);

  if (session && !session.user.isProfileComplete) {
    redirect("/complete-profile");
  }

  return <HomeClient session={session} />;
}
