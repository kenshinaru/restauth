import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const ai = {
  base: {
    api: 'https://toki-41b08d0904ce.herokuapp.com/api/conciseai/chat'
  },
  generateSignature: function (inputString, key) {
    try {
      const hmac = crypto.createHmac('sha256', 'CONSICESIGAIMOVIESkjkjs32120djwejk2372kjsajs3u293829323dkjd8238293938wweiuwe');
      hmac.update(key + inputString + 'normal');
      return hmac.digest('hex');
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  boomIdkWhatToNameThisOne: function (messages) {
    return messages.map(msg => {
      const role = msg.role.toUpperCase();
      return `${role}: ${msg.content}`;
    }).join("\n");
  },
  chat: async function (q) {
    const messages = [{ role: 'user', content: q }]
    const user_id = hehe().replaceAll('-', '');
    const lastMessage = ai.boomIdkWhatToNameThisOne(messages);
  
    const signature = ai.generateSignature(lastMessage, user_id);
    
    const data = new URLSearchParams();
    data.append('question', lastMessage);
    data.append('conciseaiUserId', user_id);
    data.append('signature', signature);
    data.append('previousChats', JSON.stringify([{ a: "", b: lastMessage, c: false }]));
    data.append('model', 'normal');

    const noo = await fetch(ai.base.api, {
      method: 'POST',
      headers: {
        'User-Agent': 'okhttp/4.10.0',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    });
    
    if (!noo.ok) throw new Error("Something went wrong!");
    
    const resp = await noo.json();
    
    return resp.answer || 'No message found.';
  }
};

export default ai
