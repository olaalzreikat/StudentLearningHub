import { useEffect, useRef, useState } from "react";
import ChatBotIcon from "./ChatBotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import { chatBotInfo } from "../data/chatBotInfo";
import "./ChatBot.css";

const ChatBot = () => {
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
  {
    hideInChat: true,
    role: "assistant",
    text: chatBotInfo,
  },
]);
 const generateBotResponse = async (history) => {
  // Remove messages that should not be sent to the API
  const filteredHistory = history.filter(msg => !msg.hideInChat);
  // Helper to update chat history
  const updateHistory = (text, isError = false) => {
    setChatHistory(prev => [
      ...prev.filter(msg => msg.text !== "Thinking..."),
      { role: "assistant", text, isError }
    ]);
  };
  // Build valid OpenRouter messages
  const systemMessage = {
  role: "system",
  content: JSON.stringify(chatBotInfo)
};
const messages = [
  systemMessage,
  ...filteredHistory.map(({ role, text }) => ({
    role,
    content: typeof text === "string" ? text : JSON.stringify(text)
  }))
];
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Equalizer Learning Hub",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages
    }),
  };
  try {
    const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "Something went wrong!");
    }
    const apiResponseText = data.choices[0].message.content.trim();
    updateHistory(apiResponseText);
  } catch (error) {
    updateHistory(error.message, true);
  }
};
  useEffect(() => {
    // Auto-scroll whenever chat history updates
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);
  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
        <span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/></svg></span>
        <span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatBotIcon />
            <h2 className="logo-text">Equalizer Chatbot</h2>
          </div>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatBotIcon />
            <p className="message-text">
              Hey there, I'm your Equalizer Learning Hub chatbot.  <br /> How can I help you today?
            </p>
          </div>
          {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};
export default ChatBot;