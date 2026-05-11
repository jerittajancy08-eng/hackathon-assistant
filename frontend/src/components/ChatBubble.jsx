import HackathonCard from './HackathonCard';

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
    const cards = parseHackathonCards(content);

    if (cards && cards.length > 0) {
      return renderHackathonCards(cards);
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const elements = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    const appendText = (text) => {
      const lines = text.split('\n');

      lines.forEach((line, index) => {
        if (index > 0) {
          elements.push(<br key={`br-${key++}`} />);
        }

        if (line) {
          elements.push(
            <span key={`text-${key++}`}>
              {line}
            </span>
          );
        }
      });
    };

    while ((match = urlRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        appendText(
          content.slice(lastIndex, match.index)
        );
      }

      elements.push(
        <a
          key={`link-${key++}`}
          href={match[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300 hover:text-cyan-100 underline underline-offset-2 transition-colors"
        >
          {match[0]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      appendText(content.slice(lastIndex));
    }

    return elements.length > 0
      ? elements
      : content;
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
