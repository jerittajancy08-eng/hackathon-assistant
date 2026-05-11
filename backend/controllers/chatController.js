const ChatSession = require('../models/ChatSession');
const Hackathon = require('../models/Hackathon');
const { createAiResponse } = require('../utils/openaiClient');

const HACKATHON_INTENT_PATTERN = /hackathon|hackathons/i;
const KEYWORD_PATTERNS = {
  ai: /(?:\bai\b|artificial intelligence|machine learning)/i,
  web3: /(?:\bweb3\b|blockchain|crypto)/i,
  beginner: /(?:\bbeginner\b|newcomer|entry[- ]level|first[- ]time)/i,
  online: /(?:\bonline\b|virtual\b|remote\b)/i,
};

function buildHackathonQuery(prompt) {
  if (!prompt || !HACKATHON_INTENT_PATTERN.test(prompt)) {
    return null;
  }

  const conditions = [];

  if (KEYWORD_PATTERNS.online.test(prompt)) {
    conditions.push({ isOnline: true });
  }

  if (KEYWORD_PATTERNS.beginner.test(prompt)) {
    conditions.push({
      $or: [
        { beginnerFriendly: true },
        { experienceLevel: /beginner/i },
      ],
    });
  }

  if (KEYWORD_PATTERNS.ai.test(prompt)) {
    conditions.push({
      $or: [
        { domain: /(?:ai|artificial intelligence|machine learning)/i },
        { tags: /(?:ai|artificial intelligence|machine learning)/i },
        { title: /(?:ai|artificial intelligence|machine learning)/i },
        { description: /(?:ai|artificial intelligence|machine learning)/i },
      ],
    });
  }

  if (KEYWORD_PATTERNS.web3.test(prompt)) {
    conditions.push({
      $or: [
        { domain: /(?:web3|blockchain|crypto)/i },
        { tags: /(?:web3|blockchain|crypto)/i },
        { title: /(?:web3|blockchain|crypto)/i },
        { description: /(?:web3|blockchain|crypto)/i },
      ],
    });
  }

  if (conditions.length === 0) {
    conditions.push({
      $or: [
        { title: /hackathon/i },
        { description: /hackathon/i },
        { domain: /hackathon/i },
        { tags: /hackathon/i },
      ],
    });
  }

  return { $and: conditions };
}

async function searchHackathonsByPrompt(prompt) {
  const query = buildHackathonQuery(prompt);
  if (!query) {
    return null;
  }

  return Hackathon.find(query)
    .sort({ startDate: 1 })
    .limit(6)
    .lean();
}

function formatHackathonResponse(hackathons) {
  if (!hackathons || hackathons.length === 0) {
    return '';
  }

  const lines = [
    `Here are ${hackathons.length} hackathon${hackathons.length === 1 ? '' : 's'} matching your request:`,
    '',
  ];

  hackathons.forEach((hackathon, index) => {
    const startDate = hackathon.startDate
      ? new Date(hackathon.startDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'TBD';

    const location = hackathon.isOnline ? 'Online' : hackathon.location || 'Offline';
    const beginnerFriendly = hackathon.beginnerFriendly ? 'Yes' : 'No';
    const domain = hackathon.domain || 'General';

    lines.push(`${index + 1}. ${hackathon.title}`);
    lines.push(`   • Domain: ${domain}`);
    lines.push(`   • Location: ${location}`);
    lines.push(`   • Beginner-friendly: ${beginnerFriendly}`);
    lines.push(`   • Start date: ${startDate}`);
    if (hackathon.url) {
      lines.push(`   • URL: ${hackathon.url}`);
    }
    lines.push('');
  });

  lines.push('If you want more hackathon options or a different focus, just ask.');
  return lines.join('\n');
}

async function handleChat(req, res, next) {
  try {
    const { messages, sessionId } = req.body;
    const lastUserMessage = messages?.filter((msg) => msg.role === 'user').slice(-1)[0]?.content || '';
    let responseText = '';

    const hackathonSearchResults = await searchHackathonsByPrompt(lastUserMessage);
    if (hackathonSearchResults && hackathonSearchResults.length > 0) {
      responseText = formatHackathonResponse(hackathonSearchResults);
    } else {
      responseText = await createAiResponse(messages);
    }

    let session = null;
    if (req.user) {
      if (sessionId) {
        session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
      }

      if (!session) {
        session = await ChatSession.create({
          user: req.user._id,
          name: 'Hackathon Assistant Session',
          messages: [...messages, { role: 'assistant', content: responseText }],
        });
      } else {
        session.messages = [...messages, { role: 'assistant', content: responseText }];
        await session.save();
      }
    }

    return res.status(200).json({ answer: responseText, sessionId: session?.id });
  } catch (error) {
    next(error);
  }
}

async function loadSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(200).json({ session });
  } catch (error) {
    next(error);
  }
}

module.exports = { handleChat, loadSession, searchHackathonsByPrompt };
