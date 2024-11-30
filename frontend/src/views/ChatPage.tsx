'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH3, TypographyP } from "@/components/ui/typography"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/contexts/user/context"
import { Chat, Message } from "@/lib/types/chat"
import { User } from "@/lib/types/user"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export const ChatPage = () => {
  const { user } = useUser();
  const [chat, setChat] = useState<Chat | null>(null);
  const [peer, setPeer] = useState<User | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const params = useParams();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token") || "{}");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/chat/chats/${params.chatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token.access_token}`
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setChat(data);
          setMessages(data.messages)
        } else {
          console.log("Chat not found");
        }
      } catch (error) {
        console.log("An error occurred");
        console.log(error)
      }
    };
    if (params.chatId) fetchChat();
  }, [params]);

  useEffect(() => {
    const fetchPeer = async (id: string) => {
      try {
        const token = JSON.parse(localStorage.getItem("token") || "{}");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/auth/users/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token.access_token}`
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPeer(data);
        }
      } catch (error) {
        console.log("An error occurred");
        console.log(error)
      }
    }

    if (chat && user) {
      if (user?.role === "Buyer") {
        fetchPeer(chat.farmer_id);
      } else {
        fetchPeer(chat.buyer_id);
      }
    }
  }, [chat, user]);

  useEffect(() => {
    if (!chat || !user) return;

    const token = JSON.parse(localStorage.getItem('token') || '{}');

    const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND}/chat/ws/chat/${chat.id}?token=${token.access_token}`;

    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else {
        if (data.sender_id !== user.id) setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [chat, user]);

  const handleSendMessage = () => {
    if (!socket || !user || !newMessage.trim()) return;

    socket.send(JSON.stringify({
      content: newMessage
    }));
    setNewMessage('');
    setMessages((prevMessages) => [...prevMessages, {
        sender_id: user.id,
        content: newMessage
    }]);
    
  };

  if (!chat || !peer || !user)
    return (
      <main className="m-auto w-full max-w-[500px] h-[calc(100dvh-90px)] relative border flex flex-col items-center justify-between gap-2">
        <div className="w-full flex items-center justify-center border-b py-2">
          <Skeleton className="h-6 w-1/2" />
        </div>

        <div className="flex flex-col h-full gap-2 w-full p-4">
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 ${
                index % 2 === 0 ? "items-end" : "items-start"
              }`}
            >
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        <div className="flex w-full items-center gap-2 sticky bottom-0 py-4 px-2 border-t left-0">
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    );

  return (
    <main className="m-auto w-full max-w-[500px] h-[calc(100dvh-90px)] relative border flex flex-col items-center justify-between gap-2">
      <div className="w-full flex items-center justify-center border-b py-2">
        <TypographyH3>{`Chat with ${peer?.fullname}`}</TypographyH3>
      </div>

      <div className="flex flex-col h-full  gap-2 w-full p-4">
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 ${
                message.sender_id === user.id ? "items-end" : "items-start"
              }`}
            >
              <TypographyP>{message.content}</TypographyP>
            </div>
          ))}
      </div>

      <div className="flex w-full items-center gap-2 sticky bottom-0 py-4 px-2 border-t left-0">
        <Input
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </main>
  );
};
