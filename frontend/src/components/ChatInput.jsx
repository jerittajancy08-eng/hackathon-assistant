import { useState } from 'react';

function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim()) return;

    const userMessage = text.trim();

    onSend(userMessage);

    setText('');

    try {
      const response = await fetch(
        'shttps://hackathon-assistant-ly4m-9fsddxqz1.vercel.app/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      onSend(data.reply, 'assistant');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-3xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20"
    >
      <label className="text-sm font-medium text-slate-300">
        Ask the Hackathon Assistant
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="3"
        placeholder="Ask for AI hackathons, beginner-friendly events, web3 competitions, or virtual hackathons..."
        className="min-h-[110px] rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
        disabled={disabled}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Supports chat history and AI-guided hackathon planning.
        </p>

        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Send
        </button>
      </div>
    </form>
  );
}

export default ChatInput;
