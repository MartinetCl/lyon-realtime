import { useState } from "react";
import { Socket } from "socket.io-client";

export interface IMessage {
  id: number;
  username: string;
  content: string;
  translated: string;
  translatedFor: string;
  timeSent: string;
  verified: boolean;
}

interface Props {
  message: IMessage;
  isMe: boolean;
  socket: Socket;
  username: string;
}

const Message = ({ message, isMe, socket, username }: Props) => {
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-translate", {
      selectedLanguage,
      message,
      username,
    });
  }

  const handleVerified = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-verified", {
      message,
      username,
    });
  }

  return (
    <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
      <div className="chat-header">
        {message.username}
        <time className="text-xs opacity-50">{message.timeSent}</time>
      </div>
      <div
        className={`chat-bubble ${isMe ? "chat-bubble-primary" : "chat-bubble-secondary"
          }`}
      >
        {username == message.translatedFor ? message.translated : message.content}
        <form onSubmit={handleSubmit} className="mt-3">
          <button className="btn btn-sm bg- ml-3">Traduire</button>
          <label>
            <select
              onChange={(e) => setSelectedLanguage(e.target.value)}
              defaultValue="english"
              className="select select-sm ml-3"
            >
              <option value="english">Anglais</option>
              <option value="french">Français</option>
            </select>
          </label>
        </form>
        <form onSubmit={handleVerified} className="mt-3">
          <button className="btn btn-sm bg- ml-3">Vérifier</button>
          <div>{message.verified == true ? 'Vrai' : 'Faux'}</div>
        </form>
      </div>
    </div>
  );
};

export default Message;
