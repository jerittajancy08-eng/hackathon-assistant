import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { sendMessage } from "./services/chatService";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
const [currentChatId, setCurrentChatId] = useState(null);
const messagesEndRef = useRef(null);
const [loading, setLoading] = useState(false);
useEffect(() => {
  const savedChats =
    JSON.parse(localStorage.getItem("chatHistory")) || [];

  setChatHistory(savedChats);

  if (savedChats.length > 0) {
    setMessages(savedChats[0].messages);
    setCurrentChatId(savedChats[0].id);
  }
}, []);
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);
  async function handleSend() {
  if (!message.trim()) return;

     const userMessage = {
  role: "user",
  content: message,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};
 

  const updatedMessages = [...messages, userMessage];

setMessages(updatedMessages);
setMessage("");

  try {
    setMessages((prev) => [
  ...prev,
  { role: "assistant", content: "Thinking..." },
]);
    const data = await sendMessage(message);
    if (
  message.toLowerCase().includes("hackathon") ||
  message.toLowerCase().includes("ai") ||
  message.toLowerCase().includes("web")
) {
  const res = await fetch(
    `http://localhost:5000/api/hackathons/search?q=${message}`
  );
  const hackathons = await res.json();
console.log(hackathons);

  const formatted = hackathons
  .slice(0, 5)
  .map(
    (h) => `
━━━━━━━━━━━━━━
🏆 ${h.title}

📍 Location: ${h.location}

🎯 Domain: ${h.domain}

🚀 Mode: ${h.mode}

💰 Prize: ${h.prize}

📅 Date: ${h.date}

🔗 [Register Here](${h.link})
━━━━━━━━━━━━━━
`
  )
  .join("\n");

  data.reply =
    "Here are some hackathons from database:\n\n" +
    formatted;
}
setLoading(true);
    const fullReply = data.reply || "No response";

let currentText = "";

const aiMessage = {
  role: "assistant",
  content: "",
};

const updated = [
  ...updatedMessages,
  {
    role: "assistant",
    content: currentText,
    time: new Date().toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
}),
  },
];

setMessages(updated);
setLoading(false);

const updatedChat = {
  id: currentChatId || Date.now(),
  title: updatedMessages[0]?.content || "New Chat",
  messages: updated,
};

let newHistory = [...chatHistory];

const existingIndex = newHistory.findIndex(
  (chat) => chat.id === updatedChat.id
);

if (existingIndex >= 0) {
  newHistory[existingIndex] = updatedChat;
} else {
  newHistory.unshift(updatedChat);
}

setChatHistory(newHistory);

localStorage.setItem(
  "chatHistory",
  JSON.stringify(newHistory)
);

setCurrentChatId(updatedChat.id);

for (let i = 0; i < fullReply.length; i++) {
  currentText += fullReply[i];

  await new Promise((resolve) =>
    setTimeout(resolve, 15)
  );

  setMessages((prev) => {
    const updated = [...prev];

    updated[updated.length - 1] = {
      role: "assistant",
      content: currentText,
    };

    return updated;
  });
}
  } catch (error) {
    console.error(error);
    setLoading(false);
  }

  setMessage("");
}

  return (
    <div
  style={{
    background: "#020617",
    display: "flex",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >
      <div
  style={{
    width: "260px",
    background: "#0f172a",
    padding: "20px",
    borderRight: "1px solid #1e293b",
    height: "100vh",
    overflowY: "auto",
  }}
>
  <button
    onClick={() => {
      setMessages([]);
      setCurrentChatId(null);
    }}
    style={{
      width: "100%",
      padding: "12px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      marginBottom: "20px",
    }}
  >
    + New Chat
  </button>

  {chatHistory.map((chat) => (
    <div
      key={chat.id}
      onClick={() => {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
      }}
      style={{
        padding: "10px",
        background:
          currentChatId === chat.id
            ? "#1e293b"
            : "transparent",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "10px",
      }}
    >
      {chat.title}
    </div>
  ))}
  </div>

<div style={{ flex: 1, padding: "40px" }}>
      <h1>Hackathon Assistant</h1>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleSend();
  }
}}
        placeholder="Ask something..."
        style={{
          padding: "10px",
          width: "300px",
          color: "black",
        }}
      />

      <button
        onClick={handleSend}
        style={{
          marginLeft: "10px",
          padding: "10px",
        }}
      >
        Send
      </button>

      <div
  style={{
    marginTop: "20px",
    overflowY: "auto",
    height: "70vh",
  }}
>
  {messages.map((msg, index) => (
    <div
  key={index}
 style={{
  display: "flex",

  flexDirection:
    msg.role === "user"
      ? "row-reverse"
      : "row",

  alignItems: "flex-start",
  gap: "10px",
  marginBottom: "15px",
}}
>
  {msg.role === "assistant" ? (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "#1d4ed8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
      }}
    >
      🤖
    </div>
  ) : (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
      }}
    >
      👤
    </div>
  )}

  <div
    style={{
  background:
    msg.role === "user" ? "#2563eb" : "#1e293b",
  maxWidth: "70%",
  wordBreak: "break-word",
}}
  >
             <ReactMarkdown
  components={{
    a: ({ node, ...props }) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#60a5fa",
          textDecoration: "underline",
        }}
      />
    ),
  }}
>
  {msg.content}
</ReactMarkdown>
      <div
  style={{
    fontSize: "12px",
    opacity: 0.7,
    marginTop: "6px",
  }}
>
  {msg.time}
</div>
    </div>
  </div>
))}
<div ref={messagesEndRef} />
{loading && (
  <div
    style={{
      background: "#1e293b",
      padding: "12px",
      borderRadius: "12px",
      width: "fit-content",
      marginTop: "10px",
      color: "white",
    }}
  >
    Typing...
  </div>
)}
    </div>
  </div></div>
);
}

export default App;