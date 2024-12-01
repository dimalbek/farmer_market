import React, { useState, useEffect, useRef } from "react";

interface Message {
  sender_id: number;
  content: string;
}

interface ChatProps {
  chatId: number; // The chat room ID
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    // Establish a WebSocket connection with the token in the query string
    const websocket = new WebSocket(`ws://localhost:8000/ws/chats/${chatId}?token=${token}`);
    websocketRef.current = websocket;

    websocket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "history") {
        // Load chat history
        setMessages(data.messages);
      } else if (data.type === "message") {
        // Add new incoming message
        setMessages((prev) => [...prev, { sender_id: data.sender_id, content: data.content }]);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      websocket.close();
    };
  }, [chatId]);

  // Scroll to the bottom of the chat box when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = { content: newMessage };

    // Send the new message through the WebSocket
    websocketRef.current?.send(JSON.stringify(message));
    setNewMessage("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div
        ref={chatBoxRef}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          height: "400px",
          overflowY: "scroll",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              textAlign: message.sender_id === 1 ? "right" : "left", // Replace "1" with the current user's ID
            }}
          >
            <strong>{message.sender_id === 1 ? "You" : `User ${message.sender_id}`}</strong>: {message.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: "1",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
