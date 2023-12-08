"use client";
import Messages from "@/components/chat/Messages";
import SendMessage from "@/components/chat/SendMessage";
import Username from "@/components/chat/Username";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [texte, setTexte] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.once("messages-old", (data) => {
      setMessages((msg) => [...msg, ...data] as any);
    });

    socket.on("chat-message", (data) => {
      setMessages((msg) => [...msg, data] as any);
    });

    socket.on("chat-update", (data) => {
      setMessages((msg) => {
        const updatedMessages = msg.map((message: any) => {
          return message.id === data.id ? data : message;
        });
        return updatedMessages as any;
      });
    });

    socket.on("chat-suggest", (data) => {
      setTexte((texte) => { return data.texte })
    });
  }, []);

  return (
    <div>
      <h1>Chat</h1>
      <Username socket={socket} setUsername={setUsername} />
      <SendMessage texte={texte} socket={socket} username={username} />
      <Messages messages={messages} socket={socket} username={username} />
    </div>
  );
};

export default Chat;
