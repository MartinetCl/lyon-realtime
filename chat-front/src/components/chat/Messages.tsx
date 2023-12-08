import { Socket } from "socket.io-client";
import Message, { IMessage } from "./Message";

interface Props {
  messages: IMessage[];
  username: string;
  socket: Socket;
}

const Messages = ({ messages, username, socket }: Props) => {
  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.timeSent}>
          <Message message={msg} username={username} socket={socket} isMe={msg.username == username} />
        </div>
      ))}
    </div>
  );
};

export default Messages;
