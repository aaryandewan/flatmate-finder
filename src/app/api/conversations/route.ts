import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

// ... existing imports ...

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    // Find all chats where the user is a participant

    let objectIdUserId;
    try {
      objectIdUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid userId format:", userId);
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 }
      );
    }

    const conversations = await Chat.find({
      "participants.userId": objectIdUserId,
    })
      .select("messages participants lastMessage")
      .lean()
      .exec();

    console.log("Raw Conversations =", JSON.stringify(conversations, null, 2));

    if (conversations.length === 0) {
      console.log("No conversations found. Checking total chat count...");
      const totalChats = await Chat.countDocuments();
      console.log("Total chats in database:", totalChats);
    }

    // const conversations = await Chat.find({ participants: userId })
    //   .select("messages participants") // Only select messages and participants
    //   //   .sort({ "lastMessage.timestamp": -1 }) // Still sort by most recent message
    //   .exec();

    // console.log("Conversations = ", conversations);

    // // Reverse the messages array for each conversation
    // const formattedConversations = conversations.map((conv) => ({
    //   ...conv.toObject(),
    //   messages: conv.messages.reverse(),
    // }));

    const allChats = await Chat.find().select("participants").lean().exec();
    console.log("All chats participants:", JSON.stringify(allChats, null, 2));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Could not fetch conversations" },
      { status: 500 }
    );
  }
}
