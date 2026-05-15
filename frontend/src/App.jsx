import { useState, useEffect, useRef } from "react";
import { sendMessage } from "./services/chatService";

const URL_REGEX = /https?:\/\/[^\s)]+/g;
const FALLBACK_TEXT = "Unable to receive a response. Please try again.";

const normalizeText = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean).join("\n\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const text = normalizeText(item);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return String(value);
};

const sanitizeText = (text) => {
  if (typeof text !== "string") return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,6}\s/gm, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1: $2")
    .trim();
};

const getResponseText = (data) => {
  if (!data) return FALLBACK_TEXT;

  const raw =
    data.reply ??
    data.message ??
    data.content ??
    data.answer ??
    data.result ??
    data;

  if (Array.isArray(raw)) {
  return raw
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return `
${item.title ? `## ${item.title}` : ""}

${item.description || ""}

${item.link ? `🔗 Official Link: ${item.link}` : ""}
        `.trim();
      }

      return normalizeText(item);
    })
    .filter(Boolean)
    .join("\n\n");
}

  if (typeof raw === "object") {
    return normalizeText(raw) || FALLBACK_TEXT;
  }

  const normalized = normalizeText(raw);
  return normalized || FALLBACK_TEXT;
};

const renderInlineText = (text) => {
  const safeText = String(text || "");
  const fragments = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(safeText)) !== null) {
    const url = match[0];
    const start = match.index;

    if (start > lastIndex) {
      fragments.push(safeText.slice(lastIndex, start));
    }

    fragments.push(
      <a
        key={`${start}-${url}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="smart-link"
      >
        {url}
      </a>
    );
    lastIndex = start + url.length;
  }

  if (lastIndex < safeText.length) {
    fragments.push(safeText.slice(lastIndex));
  }

  return fragments.length > 0 ? fragments : safeText;
};

const renderMessageContent = (content) => {
  const safeContent = sanitizeText(normalizeText(content));
  if (!safeContent) return null;

  const blocks = safeContent
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n");
    const isList = lines.every((line) => /^[-*]\s+/.test(line));

    if (isList) {
      return (
        <ul className="message-list" key={blockIndex}>
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInlineText(line.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p className="message-text" key={blockIndex}>
        {lines.flatMap((line, lineIndex) => [
          renderInlineText(line),
          lineIndex < lines.length - 1 ? <br key={`br-${blockIndex}-${lineIndex}`} /> : null,
        ])}
      </p>
    );
  });
};

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(savedChats);
    if (savedChats.length > 0) {
      setMessages(savedChats[0].messages);
      setCurrentChatId(savedChats[0].id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getChatTitle = (text) => {
    if (!text) return "New Chat";
    return text.length > 24 ? `${text.slice(0, 24)}...` : text;
  };

  const saveChatHistory = (updatedChat) => {
    const newHistory = [...chatHistory];
    const existingIndex = newHistory.findIndex((chat) => chat.id === updatedChat.id);

    if (existingIndex >= 0) {
      newHistory[existingIndex] = updatedChat;
    } else {
      newHistory.unshift(updatedChat);
    }

    setChatHistory(newHistory);
    localStorage.setItem("chatHistory", JSON.stringify(newHistory));
    setCurrentChatId(updatedChat.id);
  };

  const handleSend = async (customMessage) => {
    const finalMessage = customMessage || message;
    if (!finalMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: finalMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");

    const data = await sendMessage(finalMessage);
    const botReply = getResponseText(data);

    const assistantMessage = {
      role: "assistant",
      content: botReply,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const finalMessages = [...updatedMessages, assistantMessage];
    setMessages(finalMessages);

    const updatedChat = {
      id: currentChatId || Date.now(),
      title: getChatTitle(updatedMessages[0]?.content || "New Chat"),
      messages: finalMessages,
      createdAt: new Date().toISOString(),
    };

    saveChatHistory(updatedChat);
  };

  const deleteChat = (id, event) => {
    event.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;
    const newHistory = chatHistory.filter((c) => c.id !== id);
    setChatHistory(newHistory);
    localStorage.setItem("chatHistory", JSON.stringify(newHistory));
    if (currentChatId === id) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const clearAllChats = () => {
    if (!window.confirm("Clear all chats?")) return;
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
    setMessages([]);
    setCurrentChatId(null);
  };

  const quickPrompts = [
    { label: "AI", prompt: "suggest ai hackathon ideas" },
    { label: "Web3", prompt: "suggest web3 hackathon ideas" },
    { label: "Online", prompt: "suggest online hackathons" },
    { label: "Offline", prompt: "suggest offline hackathons" },
  ];

  return (
    <div className="app-container app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <div className="sidebar-title">Hackathon Assistant</div>
            <div className="sidebar-subtitle">Smart chat + curated ideas</div>
          </div>
          <button className="clear-button" onClick={clearAllChats}>
            Clear
          </button>
        </div>

        <button
          className="new-chat-button"
          onClick={() => {
            setMessages([]);
            setCurrentChatId(null);
          }}
        >
          + New Chat
        </button>

        <div className="sidebar-list">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`sidebar-item ${currentChatId === chat.id ? "active" : ""}`}
              onClick={() => {
                setMessages(chat.messages);
                setCurrentChatId(chat.id);
              }}
            >
              <span>{chat.title}</span>
              <button className="delete-icon" onClick={(e) => deleteChat(chat.id, e)}>
                ✖
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="content-panel">
        <section className="controls-row">
          {quickPrompts.map((item) => (
            <button key={item.label} className="filter-button" onClick={() => handleSend(item.prompt)}>
              {item.label}
            </button>
          ))}
        </section>

        <section className="chat-input-row">
          <input
            className="input-glass"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Ask something..."
          />
          <button className="send-button" onClick={handleSend} disabled={!message.trim()}>
            Send
          </button>
        </section>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>{msg.role === "assistant" ? "🤖" : "👤"}</div>
              <div className={`message-bubble ${msg.role}`}>
                <div className="message-content">{renderMessageContent(msg.content)}</div>
                <div className="message-time">{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
}

export default App;
