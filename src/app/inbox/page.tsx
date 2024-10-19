"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useSession } from "next-auth/react";

type Message = {
  _id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

type participant = {
  userId: string;
  name: string;
};

type Conversation = {
  _id: string;
  participants: participant[];
  messages: Message[];
};

export default function InboxPage() {
  const { data: session } = useSession(); // Get logged-in user data
  const [conversations, setConversations] = useState<Conversation[]>();
  const [x, setX] = useState();
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize the socket connection when the component mounts
  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // Ensure to use your deployed backend URL if necessary
    setSocket(newSocket);

    // Fetch conversations when the session is ready
    if (session?.user.id) {
      fetchConversations();
    }

    return () => {
      newSocket.disconnect(); // Cleanup socket connection
    };
  }, [session]);

  // Fetch conversations from the backend
  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `/api/conversations?userId=${session?.user.id}`
      );
      // Wrap the single conversation in an array
      setConversations(response.data);
      // const otherUserId;
      // conversations.map(conv => {

      // })
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Handle selecting a chat conversation
  const handleChatSelect = (conversation: Conversation) => {
    setActiveChat(conversation);
    if (socket && session?.user.id && conversation._id) {
      socket.emit("joinRoom", {
        userId: session?.user.id,
        ownerId: conversation.participants.find(
          (p) => p.userId != session?.user.id
        ).userId,
      });
    }
    let jj = conversation.participants.find(
      (p) => p.userId != session?.user.id
    );

    console.log(jj);
  };

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeChat && session?.user.id && socket) {
      const messageContent = newMessage; // Store the message content
      const messageData = {
        senderId: session?.user.id,
        receiverId: activeChat.participants.find(
          (p) => p.userId !== session?.user.id
        ).userId,
        flatId: activeChat._id,
        content: messageContent,
      };

      socket.emit("sendMessage", messageData);
      setNewMessage("");

      const newMessageObj: Message = {
        _id: Date.now().toString(),
        senderId: session?.user.id,
        text: messageContent,
        timestamp: new Date().toISOString(),
      };

      // Update the local state
      const updatedConversations = conversations.map((conv) =>
        conv._id === activeChat._id
          ? {
              ...conv,
              messages: [...conv.messages, newMessageObj],
            }
          : conv
      );

      setConversations(updatedConversations);
    }
  };

  // Handle receiving messages in real time
  useEffect(() => {
    if (socket && activeChat) {
      socket.on("receiveMessage", (message) => {
        setActiveChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, message],
              }
            : prev
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket, activeChat]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <div className="w-full flex">
        {/* Left Panel - Conversation List */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-semibold">Inbox</h2>
          </div>
          <ScrollArea className="flex-grow">
            {conversations?.map((conversation) => (
              <div
                key={conversation._id}
                className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                  activeChat?._id === conversation._id ? "bg-accent" : ""
                }`}
                onClick={() => handleChatSelect(conversation)}
              >
                <h3 className="font-semibold">
                  Chat with{" "}
                  {conversation.participants?.find(
                    (p) => p.userId !== session?.user.id
                  )?.name || "Unknown"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.messages[conversation.messages.length - 1]
                    ?.text || "No messages yet"}
                </p>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Right Panel - Active Chat or No Chat Selected */}
        <div className="w-2/3 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                  Chat with{" "}
                  {
                    activeChat.participants.find(
                      (p) => p.userId !== session?.user.id
                    )?.name
                  }
                </h2>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-grow p-4">
                {activeChat.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 max-w-[70%] ${
                      message.senderId === session?.user.id
                        ? "ml-auto"
                        : "mr-auto"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        message.senderId === session?.user.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </ScrollArea>

              {/* Message Input Area */}
              <div className="p-4 border-t">
                <form className="flex gap-2" onSubmit={handleSendMessage}>
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-grow"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-muted-foreground">No chat selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
