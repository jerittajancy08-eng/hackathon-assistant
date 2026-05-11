import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import LoadingSpinner from './LoadingSpinner';
import { sendChatMessage } from '../services/chatService';

function ChatBot({ messages, setMessages, sessionId, authToken, onSaveSession }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (content) => {
  const userMessage = {
    role: 'user',
    content
  };

  const updatedMessages = [...messages, userMessage];

  setMessages(updatedMessages);

  try {
    const response = await sendChatMessage(
      updatedMessages,
      sessionId,
      authToken
    );

    const assistantMessage = {
      role: 'assistant',
      content: response.reply
    };

    setMessages([
      ...updatedMessages,
      assistantMessage
    ]);

  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="rounded-[2rem] border border-slate-700/70 bg-slate-950/90 p-4 shadow-xl shadow-slate-900/50 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">AI Chat</p>
            <h2 className="text-xl font-semibold text-white">Hackathon Assistant</h2>
          </div>
          <div className="rounded-3xl bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
            Always ready for event planning tips
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[64vh] space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 text-slate-300">
              <LoadingSpinner />
              <span className="text-sm">Hackathon Assistant is drafting your reply...</span>
            </div>
          )}
        </div>
      </div>


      <ChatInput onSend={handleSend} disabled={isLoading} />

      <div className="text-xs text-slate-500">
        Tip: Ask about AI hackathons, beginner-friendly events, web3 competitions, and virtual hackathon opportunities.
      </div>
    </div>
  );
}

export default ChatBot;
