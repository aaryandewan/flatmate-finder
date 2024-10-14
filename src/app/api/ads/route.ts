import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Flat from "@/models/Flat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { city, rent, genderPreference, description, images } = body;
    const postedBy = {
      name: "aaryan",
      email: "aaryandewan@google.com",
      contactNumber: "9475756361",
    };

    await dbConnect();

    const newFlat = new Flat({
      ownerId: session.user.id,
      city,
      rent,
      genderPreference,
      description,
      images,
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
