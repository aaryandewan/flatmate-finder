// src/app/home/page.tsx
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "@/lib/authOptions";

import HomeClient from "../components/HomeClient";

export default async function Home() {
  // Fetch the session server-side to avoid flickering
  const session = await getServerSession(authOptions);

  return <HomeClient session={session} />;
}
