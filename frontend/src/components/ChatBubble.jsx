import HackathonCard from './HackathonCard';
import { cleanupResponse } from '../utils/responseFormatter';

function ChatBubble({ message }) {
  const isAssistant = message.role === 'assistant';

  const bubbleClass = isAssistant
    ? 'bg-slate-900/90 text-slate-200 ring-1 ring-slate-700/80'
    : 'bg-cyan-500/10 text-cyan-100 ring-1 ring-cyan-400/20';

  const genericPatterns =
    /how to|tips|guide|choose|team|teammate|hackathon ideas|project ideas/i;

  const parseHackathonCards = (content) => {
    if (!content) return [];

    const lines = content.split('\n').map((line) => line.trim());

    const cardEntries = [];
    let current = null;

    lines.forEach((line) => {
      const entryMatch = line.match(/^(\d+)\.\s+(.*)$/);

      if (entryMatch) {
        if (current && current.title?.trim()) {
          cardEntries.push(current);
        }

        current = {
          title: entryMatch[2],
          domain: '',
          location: '',
          beginnerFriendly: '',
          date: '',
          url: '',
        };

        return;
      }

      if (!current) return;

      const detailMatch = line.match(/^-?\s*(.+?):\s*(.*)$/);

      if (!detailMatch) return;

      const key = detailMatch[1].toLowerCase();
      const value = detailMatch[2]?.trim?.() || '';

      if (key.includes('domain')) {
        current.domain = value;
      } else if (key.includes('location')) {
        current.location = value;
      } else if (key.includes('beginner')) {
        current.beginnerFriendly = value;
      } else if (
        key.includes('start date') ||
        key.includes('date')
      ) {
        current.date = value;
      } else if (key.includes('url')) {
        current.url = value;
      }
    });

    if (current && current.title?.trim()) {
      cardEntries.push(current);
    }

    const validCards = cardEntries.filter(
      (card) =>
        card.title?.trim() &&
        card.domain?.trim?.() &&
        card.location?.trim?.() &&
        card.date?.trim?.() &&
        !genericPatterns.test(card.title || '')
    );

    return validCards;
  };

  const renderHackathonCards = (cards) => {
    if (!cards.length) return null;

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((hackathon, index) => (
          <HackathonCard
            key={index}
            hackathon={hackathon}
          />
        ))}
      </div>
    );
  };

  const renderContent = (content) => {
    const cleanContent = cleanupResponse(content);
    const cards = parseHackathonCards(cleanContent);

    if (cards && cards.length > 0) {
      return renderHackathonCards(cards);
    }

    return renderReadableText(cleanContent);
  };

  const renderInlineLinks = (text, keyPrefix) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (/^https?:\/\//i.test(part)) {
        const href = part.replace(/[),.]+$/g, '');
        return (
          <a
            key={`${keyPrefix}-link-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:text-cyan-100 underline underline-offset-2 transition-colors"
          >
            {href}
          </a>
        );
      }

      return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
    });
  };

  const renderReadableText = (content) => {
    const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

    return (
      <div className="assistant-response">
        {blocks.map((block, index) => {
          if (/^-{3,}$/.test(block)) {
            return <hr key={index} className="my-4 border-slate-700/80" />;
          }

          const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
          const isList = lines.every((line) => /^([-*•]|\d+\.)\s+/.test(line));
          const firstLine = lines[0] || '';
          const isHeading =
            lines.length === 1 &&
            !/^([-*•]|\d+\.)\s+/.test(firstLine) &&
            !/^https?:\/\//i.test(firstLine) &&
            firstLine.length <= 80;

          if (isHeading) {
            return (
              <h3 key={index} className="message-heading">
                {firstLine.replace(/^#+\s*/, '')}
              </h3>
            );
          }

          if (isList) {
            return (
              <ul key={index} className="message-list">
                {lines.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    {renderInlineLinks(line.replace(/^([-*•]|\d+\.)\s+/, ''), `${index}-${lineIndex}`)}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={index} className="message-text">
              {lines.map((line, lineIndex) => (
                <span key={lineIndex}>
                  {renderInlineLinks(line.replace(/^#+\s*/, ''), `${index}-${lineIndex}`)}
                  {lineIndex < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`rounded-3xl p-5 shadow-xl shadow-slate-950/20 transition duration-300 ${bubbleClass}`}
    >
      <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
        <span>
          {isAssistant ? 'Assistant' : 'You'}
        </span>

        <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400/80" />
      </div>

      <div className="break-words text-sm leading-7 text-slate-100">
        {renderContent(message.content)}
      </div>
    </div>
  );
}

export default ChatBubble;
