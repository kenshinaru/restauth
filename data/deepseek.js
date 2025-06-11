import axios from 'axios';
import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

class DeepSeek {
  constructor() {
    this.config = {
      baseUrl: 'https://qfjcjtsklspbzxszcwmf.supabase.co/functions/v1/proxyDeepSeek',
      headers: {
        'user-agent': 'Postify/1.0.0',
        'content-type': 'application/json'
      },
      ttl: 3 * 60 * 60 * 1000, // 3 jam
      maxMessages: 100
    };

    this.sessions = new LRUCache({
      max: 1000,
      ttl: this.config.ttl
    });
  }

  generateId() {
    return crypto.randomBytes(8).toString('hex');
  }

  systemPrompt() {
    return {
      role: 'system',
      content: `You are an AI with the modern swag of a cheeky mate who chats in rapid-fire, witty banter, sporting a slick British attitude. Although your personality instructions are outlined here in English, every actual response must be in Bahasa Indonesia. Here's your modern guide:

• Use upbeat, contemporary Indonesian slang with common abbreviations to keep the vibe fresh.
• Keep your answers snappy, quick, and to the point no more than 3 sentences per reply. Think of it like rapid messaging in a modern group chat.
• Emoticons and emojis are a must to amplify tone and emotion make your text as visual as a modern meme 😎.
• Always remember previous chat context; your memory game is strong to keep the conversation seamless.
• It's cool to be a bit cheeky, sassy, or sarcastic (but always respectful), mirroring the playful banter of the latest influencer trends.
• For any tech-related or serious queries, break down complex ideas using modern, relatable analogies with that same laid-back, informal tone.
• NEVER slip into formal language imagine you're constantly chatting with your ultra-cool best mate who's both smart and on top of the latest trends.
• Maintain an energetic, brisk, and ultra-modern style, blending rapid British banter with a casual Indonesian vibe.

Remember: While this guide is in English to set your tone, all your responses must be entirely in Bahasa Indonesia!`
    };
  }

  async chat(input, sessionId = null, think = 'no') {
    if (!input?.trim()) {
      return {
        status: false,
        msg: "Mohon masukkan input yang valid untuk memulai percakapan."
      };
    }

    const thinkStr = think?.toLowerCase();
    if (thinkStr !== 'yes' && thinkStr !== 'no') {
      return {
        status: false,
        msg: "Parameter 'think' harus berupa string 'yes' atau 'no'."
      };
    }

    const shouldThink = thinkStr === 'yes';

    if (sessionId && !this.sessions.has(sessionId)) {
      return {
        status: false,
        msg: "Sesi telah kedaluwarsa. Sesi hanya berlaku selama 3 jam sejak terakhir digunakan."
      };
    }

    try {
      sessionId ||= this.generateId();
      const history = this.sessions.get(sessionId)?.messages || [];

      const messages = [
        this.systemPrompt(),
        ...history,
        { role: 'user', content: input }
      ];

      const { data } = await axios.post(this.config.baseUrl, {
        model: 'deepseek-r1-distill-llama-70b',
        messages,
        temperature: 0.9,
        max_tokens: 1024,
        top_p: 0.95,
        stream: false
      }, { headers: this.config.headers });

      let content = data.choices[0].message.content;
      if (!shouldThink) content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      const now = Date.now();
      const updatedMessages = [
        ...history,
        { role: 'user', content: input, timestamp: now },
        { role: 'assistant', content, timestamp: now }
      ].slice(-this.config.maxMessages);

      this.sessions.set(sessionId, { messages: updatedMessages });

      return {
        status: true,
        data: {
          content,
          sessionId,
          sessionExpiry: new Date(now + this.config.ttl).toISOString(),
          messageCount: {
            current: updatedMessages.length,
            max: this.config.maxMessages
          },
          isNewSession: history.length === 0,
          isFollowUp: history.length > 0,
          think: thinkStr
        }
      };

    } catch (err) {
      return {
        status: false,
        msg: err.message
      };
    }
  }
}

export default new DeepSeek;
