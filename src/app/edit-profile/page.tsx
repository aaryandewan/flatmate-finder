import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "@/lib/authOptions";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import EditProfileForm from "./EditProfileForm";
import { redirect } from "next/navigation";

// Fetch the user's profile data server-side
export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, redirect to the sign-in page
  if (!session) {
    redirect("/auth/signin");
  }

  await dbConnect();

  // Fetch the user's profile data from MongoDB
  const user = await User.findById(session.user.id);

  // If no user data is found, redirect or handle error
  if (!user) {
    return <div>User not found.</div>;
  }

  return <EditProfileForm user={user} />;
}
