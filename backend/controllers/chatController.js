import axios from "axios";
import ChatSession from "../models/ChatSession.js";
import Hackathon from "../models/Hackathon.js";


const HACKATHON_INTENT_PATTERN = /(?:hackathon|hackathons|hackathon idea|hackathon project|team formation|team roles|form a team|presentation|pitch|MVP|tech stack|project idea|AI project|Web3 project|online hackathon|virtual hackathon|offline hackathon|in[- ]person hackathon)/i;
const KEYWORD_PATTERNS = {
  ai: /(?:\bai\b|artificial intelligence|machine learning)/i,
  web3: /(?:\bweb3\b|blockchain|crypto)/i,
  online: /(?:\bonline\b|virtual\b|remote\b)/i,
  offline: /(?:\boffline\b|in[- ]person|physical|venue\b)/i,
  team: /(?:how to form .*team|forming .*team|team roles|build a team|form a team|team structure|role .*team)/i,
  greeting: /^(?:hi|hello|hey|good morning|good afternoon|good evening)\b/i,
  chatHistory: /(?:chat history|history management|saved chats|conversation history|history feature)/i,
  deleteHistory: /(?:delete history|clear history|clear chats|delete chats|remove chat history|clear conversation)/i,
};

function buildHackathonQuery(prompt) {
  if (!prompt || !HACKATHON_INTENT_PATTERN.test(prompt)) {
    return null;
  }

  const conditions = [];

  if (KEYWORD_PATTERNS.online.test(prompt)) {
    conditions.push({ mode: /online/i });
  }

  if (KEYWORD_PATTERNS.offline.test(prompt)) {
    conditions.push({ mode: /offline/i });
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
    `• ${hackathons.length} hackathon${hackathons.length === 1 ? '' : 's'} found:`,
    '',
  ];

  hackathons.forEach((hackathon) => {
    const startDate = hackathon.startDate
      ? new Date(hackathon.startDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : hackathon.date || 'TBD';

    const location = hackathon.isOnline || /online/i.test(hackathon.mode)
      ? 'Online'
      : hackathon.location || 'Offline';
    const beginnerFriendly = hackathon.beginnerFriendly ? 'Yes' : 'No';
    const domain = hackathon.domain || 'General';

    lines.push(`• ${hackathon.title}`);
    lines.push(`  • Domain: ${domain}`);
    lines.push(`  • Location: ${location}`);
    if (hackathon.beginnerFriendly !== undefined) {
      lines.push(`  • Beginner-friendly: ${beginnerFriendly}`);
    }
    if (startDate) {
      lines.push(`  • Date: ${startDate}`);
    }
    if (hackathon.url || hackathon.link) {
      lines.push(`  • URL: ${hackathon.url || hackathon.link}`);
    }
    lines.push('');
  });

  lines.push('Ask for more hackathon details or another focus.');
  return lines.join('\n');
}

function formatBulletList(items) {
  return items.map((item) => `• ${item}`).join('\n');
}

function isHackathonIntent(prompt) {
  return HACKATHON_INTENT_PATTERN.test(prompt);
}

function isGreetingPrompt(prompt) {
  return KEYWORD_PATTERNS.greeting.test(prompt);
}

function isChatHistoryPrompt(prompt) {
  return KEYWORD_PATTERNS.chatHistory.test(prompt);
}

function isDeleteHistoryPrompt(prompt) {
  return KEYWORD_PATTERNS.deleteHistory.test(prompt);
}

function buildSystemPrompt() {
  return `You are HackBot, an advanced AI hackathon assistant.

Provide:
- real hackathon names
- real platforms
- modern tech stack suggestions
- concise but intelligent answers
- bullet points when useful
- official links only when truly useful

For short questions, answer in 4-6 lines. For medium questions, use a title plus compact bullet points. For long detailed requests, use short sections and avoid large paragraph walls.

When mentioning resources (official websites, learning platforms, documentation, communities, or tools), only output full https:// URLs. Do not output markdown link syntax like [Official Link](https://...). If you cannot confirm a resource URL, write "No official link available".

Limit links to a maximum of 3 for normal responses and 5 only for resource-specific queries. Do not spam links. Return pure URLs like https://devpost.com.

Preferred output when returning one resource:
## Resource Name

Short description.

https://example.com

Preferred output when returning multiple resources:
[
  {"title":"Devpost","description":"Hackathon hosting platform","link":"https://devpost.com/hackathons"}
]

Never hallucinate or fabricate URLs.

Answer concisely and professionally.`;
}

async function handleChat(req, res, next) {
  try {

    const { messages = [], message, sessionId } = req.body;
    const lastUserMessage =
      messages?.filter((msg) => msg.role === 'user').slice(-1)[0]?.content || message || '';

    const prompt = lastUserMessage.trim();
    if (!prompt) {
      return res.status(400).json({ answer: 'Please ask a question.' });
    }

    if (isGreetingPrompt(prompt)) {
      return res.status(200).json({ answer: 'Hello. How can I help with hackathons?' });
    }

    if (isDeleteHistoryPrompt(prompt)) {
      return res.status(200).json({
        answer: 'Use the delete or clear chat option to remove saved conversation history.',
      });
    }

    if (isChatHistoryPrompt(prompt)) {
      return res.status(200).json({
        answer: formatBulletList([
          'Saved chat sessions appear in the history panel.',
          'Use delete or clear chat to remove saved conversation history.',
        ]),
      });
    }

    console.log('API KEY EXISTS:', !!process.env.GROQ_API_KEY);
    console.log('LAST USER MESSAGE:', lastUserMessage);

    const userMessage = lastUserMessage.toLowerCase();

    // Structured real hackathon platform suggestions for common quick prompts
    if (
      userMessage.includes('suggest ai hackathon') ||
      userMessage.includes('suggest ai hackathons') ||
      userMessage.includes('suggest web3 hackathon') ||
      userMessage.includes('suggest web3 hackathons') ||
      userMessage.includes('suggest online hackathon') ||
      userMessage.includes('suggest online hackathons') ||
      userMessage.includes('suggest offline hackathon') ||
      userMessage.includes('suggest offline hackathons') ||
      userMessage.includes('latest hackathons')
    ) {
      const hackathons = [];

      // Top platforms / events (real links)
      hackathons.push({
        title: 'Devpost',
        description: 'Large platform hosting many online and in-person hackathons worldwide.',
        link: 'https://devpost.com',
      });

      hackathons.push({
        title: 'ETHGlobal',
        description: 'Ethereum-focused global hackathons and events.',
        link: 'https://ethglobal.co',
      });

      hackathons.push({
        title: 'Major League Hacking (MLH)',
        description: 'MLH runs university and community hackathons and a global events calendar.',
        link: 'https://mlh.io',
      });

      hackathons.push({
        title: 'Hack2Skill',
        description: 'Global online hackathons and developer challenges platform.',
        link: 'https://hack2skill.com',
      });

      hackathons.push({
        title: 'DoraHacks',
        description: 'Community-driven hackathons and bounty events.',
        link: 'https://dorahacks.com',
      });

      hackathons.push({
        title: 'Unstop',
        description: 'Platform for college and corporate hackathons and competitions (formerly Dare2Compete).',
        link: 'https://unstop.com',
      });

      // If user asked for a specific focus, try to order suggestions
      if (userMessage.includes('web3')) {
        hackathons.unshift(hackathons.splice(1, 1)[0]);
      } else if (userMessage.includes('ai')) {
        // keep Devpost and MLH first for AI ideas
      }

      return res.status(200).json({ answer: hackathons, isHackathons: true });
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: lastUserMessage },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('GROQ RESPONSE:', response.data);

      let responseText =
        response.data?.choices?.[0]?.message?.content ||
        'No response generated';

      // Post-process: ensure URLs are present for resource topics; append trusted fallback links when missing
      try {
        const urlRegex = /https?:\/\/[^\s)]+/g;
        const found = responseText.match(urlRegex);

        if (!found) {
          const fallbacks = [];
          if (/\b(ai|what is ai|learn ai|learn machine|machine learning)\b/i.test(prompt)) {
            fallbacks.push({
              title: 'IBM AI',
              description: 'Overview and resources about artificial intelligence.',
              link: 'https://www.ibm.com/topics/artificial-intelligence',
            });
          }

          if (/\b(web3|ethereum|eth|blockchain)\b/i.test(prompt)) {
            fallbacks.push({
              title: 'Ethereum',
              description: 'Official Ethereum resources and docs.',
              link: 'https://ethereum.org',
            });
          }

          if (/\b(hackathon|hackathons|hackathon ideas)\b/i.test(prompt)) {
            fallbacks.push({
              title: 'Devpost Hackathons',
              description: 'Find and join hackathons worldwide.',
              link: 'https://devpost.com/hackathons',
            });
          }

          if (fallbacks.length > 0) {
            const blocks = fallbacks
              .map(
                (f) =>
                  `## ${f.title}\n\n${f.description}\n\n🔗 Official Link:\n${f.link}`
              )
              .join('\n\n');

            responseText = responseText + '\n\n' + blocks;
          }
        }
      } catch (e) {
        console.log('POSTPROCESS ERROR:', e.message);
      }

      return res.json({
        answer: responseText,
      });
    } catch (error) {
      console.log(
        'FULL GROQ ERROR:',
        error.response?.data || error.message
      );

      return res.status(500).json({
        answer: 'Groq API failed',
      });
    }
  } catch (error) {
    console.log(
      'FULL ERROR:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      answer: 'Backend error occurred',
    });
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

export { handleChat, loadSession, searchHackathonsByPrompt };
