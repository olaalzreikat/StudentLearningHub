import ChatBotIcon from "./ChatBotIcon";
const ChatMessage = ({ chat }) => {
  const isUser = chat.role === "user";
  return (
    !chat.hideInChat && (
      <div className={`message ${isUser ? "user" : "bot"}-message ${chat.isError ? "error" : ""}`}>
        {!isUser && <ChatBotIcon />}
        <p className="message-text">{chat.text}</p>
      </div>
    )
  );
};
export default ChatMessage;