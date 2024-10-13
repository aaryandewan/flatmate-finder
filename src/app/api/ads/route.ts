import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Flat from "@/models/Flat"; // We will define the Flat model later
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST request to create a new ad
export async function POST(req: NextRequest) {
  try {
    // Ensure the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Destructure form data
    const { city, rent, genderPreference, description, images } = body;
    const postedBy = {
      name: "aaryan",
      email: "aaryandewan@google.com",
      contactNumber: "9475756361",
    };

    // Connect to MongoDB
    await dbConnect();

    // Create a new flat ad
    const newFlat = new Flat({
      ownerId: session.user.id, // Get the user ID from the session
      city,
      rent,
      genderPreference,
      description,
      images, // Array of image URLs
      postedBy,
    });

    // Save the ad in MongoDB
    await newFlat.save();

    return NextResponse.json({ message: "Ad created successfully!" });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
