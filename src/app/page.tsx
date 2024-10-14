// // src/app/page.tsx
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "@/lib/authOptions";

import HomeClient from "./components/HomeClient";
import { signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

// export default async function Home() {
//   // Fetch the session server-side to avoid flickering
//   const session = await getServerSession(authOptions);

//   if (session && !session.user.isProfileComplete) {
//     redirect("/complete-profile");
//   }

//   return <HomeClient session={session} />;
// }

import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && !session.user.isProfileComplete) {
    redirect("/complete-profile");
  } else if (session) {
    redirect("/flats");
  }
  // return <h1>hello</h1>;

  return <HomeClient />;
}
