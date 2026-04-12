import React from "react";
import ChatbotIcon from "./ChatbotIcon";

const formatMessage = (text) => {
  return text
    // line breaks
    .replace(/\n/g, "<br/>")

    // bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // headings (### Title)
    .replace(/### (.*?)(<br\/>|$)/g, "<strong>$1</strong><br/>")

    // bullet points (* item)
    .replace(/\* (.*?)(<br\/>|$)/g, "• $1<br/>");
};

const ChatMessage = ({ chat }) => {
  return (
    !chat.hideInChat && (
      <div
        className={`message ${
          chat.role === "model" ? "bot" : "user"
        }-message ${chat.isError ? "error" : ""}`}
      >
        {chat.role === "model" && <ChatbotIcon />}

        <p
          className="message-text"
          dangerouslySetInnerHTML={{
            __html: formatMessage(chat.text),
          }}
        ></p>
      </div>
    )
  );
};

export default ChatMessage;