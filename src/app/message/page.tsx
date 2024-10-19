"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export default function NewMessage() {
  const searchParams = useSearchParams();
  const senderId = searchParams.get("senderId");
  const ownerId = searchParams.get("ownerId");

  const [message, setMessage] = React.useState("");
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (socket && message && senderId && ownerId) {
      socket.emit("sendMessage", {
        senderId,
        receiverId: ownerId,
        content: message,
      });
      console.log("Sending message:", message);
      setMessage("");
      toast({
        description: "Message sent",
        duration: 2000,
        className: "bg-green-500 text-white",
      });
    }
  };

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER);
    setSocket(newSocket);

    if (senderId && ownerId) {
      newSocket.emit("joinRoom", { userId: senderId, ownerId });
    }

    return () => {
      newSocket.disconnect();
    };
  }, [senderId, ownerId]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Chat with the owner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end">
            <Button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Send
            </Button>
          </CardFooter>
        </Card>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
