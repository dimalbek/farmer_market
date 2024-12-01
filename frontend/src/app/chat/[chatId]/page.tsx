"use client";

import React from "react";
import Chat from "../../../widgets/Chat";

const ChatPage = ({ params }: { params: { chatId: string } }) => {
  const chatId = parseInt(params.chatId); // Get chatId from the URL

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Chat Room {chatId}</h1>
      <Chat chatId={chatId} />
    </div>
  );
};

export default ChatPage;
