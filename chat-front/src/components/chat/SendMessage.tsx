"use client";
import { useState } from "react";
import { Socket } from "socket.io-client";


interface Props {
  socket: Socket;
  username: string;
  texte: string;
}

const SendMessage = ({ socket, username, texte }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-message", {
      username,
      content: text,
      timeSent: new Date().toISOString(),
    });
    setText("");
  }

  const handleSuggest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-suggest", {});
    setText(texte)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-3">
        <label className="label">
          Message
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input bg-white"
        />
        <button className="btn ml-3" type="submit">Submit</button>
      </form>
      <form onSubmit={handleSuggest} className="mt-3">
        <button className="btn ml-3" type="submit">Suggérer</button>
      </form>
    </div>
  );
};

export default SendMessage;
