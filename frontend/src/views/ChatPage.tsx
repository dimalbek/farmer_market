'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH3, TypographyP } from "@/components/ui/typography"
import { useUser } from "@/contexts/user/context"
import { Chat, Message } from "@/lib/types/chat"
import { User } from "@/lib/types/user"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { io } from 'socket.io-client';


export const ChatPage = () => {

    const {user} = useUser();
    const [chat, setChat] = useState<Chat | null>(null);
    const [peer, setPeer] = useState<User | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const params = useParams();

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const token = JSON.parse(localStorage.getItem("token") || "{}");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND}/chat/${params.chatId}`,
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
                    setMessages(data.message);
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
            console.log(user?.role === "Buyer")
            if (user?.role === "Buyer") {
                fetchPeer(chat.farmer_id);
            } else {
                fetchPeer(chat.buyer_id);
            }
        }
    }, [chat, user])

    useEffect(() => {
        if (!chat || !user) return;
      
        const token = JSON.parse(localStorage.getItem('token') || '{}');
        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND, {
          path: '/socket.io/',
          auth: {
            token: token.access_token,
            chat_id: chat.id,
          },
          transports: ['websocket'],
        });
      
    
        newSocket.on('connect', () => {
            console.log('Socket.IO connected');
          });
        
          newSocket.on('history', (data) => {
            setMessages(data.messages);
          });
        
          newSocket.on('message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
          });
        
          newSocket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
          });
        
    
        setSocket(newSocket);
    
        return () => {
          newSocket.disconnect();
        };
    }, [chat, user]);
    
    const handleSendMessage = () => {
    if (!socket || !user || !chat || !newMessage.trim()) return;

    socket.emit('message', {
        content: newMessage,
        sender_id: user.id,
        chat_id: chat.id,
    });
    setNewMessage('');
    };
    

    if (!chat || !peer || !user) return <TypographyP>Loading...</TypographyP>
    return (
        <main className="m-auto w-full max-w-[500px] flex flex-col items-center gap-2">
            <div className="w-full flex items-center justify-center border-b py-2">
                <TypographyH3>{user?.role === "Buyer" ? `Chat with ${peer?.fullname}` : `Chat with ${peer?.fullname}`}</TypographyH3>
            </div>

            <div className="flex flex-col gap-2 w-full p-4">
                {
                    messages && messages.map((message, index) => (
                        <div key={index} className={`flex flex-col gap-1 ${message.sender_id === user.id ? "items-end" : "items-start"}`}>
                            <TypographyP>{message.content}</TypographyP>
                        </div>
                    ))
                }
            </div>

            <div className="flex w-full items-center gap-2 fixed bottom-0 py-4 px-2 border-t left-0">
                <Input placeholder="Type a message" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyPress={async (e) => {
                        if (e.key === "Enter") {
                            handleSendMessage();
                        }
                    }}
                />
                <Button onClick={handleSendMessage}>Send</Button>
            </div>
        </main>
    )
}