import axios from 'axios';

class Youtube {
  constructor() {
    this.API_BASE = 'https://r-clair-yt.hf.space';
  }

  async isUrl(url) {
    if (!url) throw { code: 400, msg: 'Linknya mana?' };
    const match = url.match(/(?:youtube\.com|youtu\.be).*?([a-zA-Z0-9_-]{11})/);
    if (!match) throw { code: 400, msg: 'Invalid URL!' };
    return match[1];
  }

  async play(query) {
    try {
      const res = await( await axios.get(`${this.API_BASE}/play`, {
        params: { q: query }
      })).data

      if (!res) throw { msg: 'No results found' };

      return {
        status: true,
        ...res
      };
    } catch (err) {
      throw { code: 500, msg: 'Failed to search or convert', error: err.message || err };
    }
  }

  async download(url, quality = '720p') {
    try {
      await this.isUrl(url);
      const res = await (await axios.get(`${this.API_BASE}/youtube`, {
        params: { url, quality }
      })).data

      if (!res) throw { msg: 'Conversion failed' };

      const isAudio = quality === '128k';
      const ext = isAudio ? '.mp3' : '.mp4';

      return {
        status: true,
        ...res
      };
    } catch (err) {
      throw { code: 500, msg: 'Failed to convert/download', error: err.message || err };
    }
  }
}

export default new Youtube();
