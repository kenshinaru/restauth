import axios from 'axios';

class SoundCloudAPI {
  constructor() {
    this.cache = { version: '', id: '' };
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Exonity/1.0';
  }

  async getClientID() {
    try {
      const { data: html } = await axios.get('https://soundcloud.com/', {
        headers: { 'User-Agent': this.userAgent }
      });

      const version = html.match(/<script>window\.__sc_version="(\d{10})"<\/script>/)?.[1];
      if (!version) return;

      if (this.cache.version === version) return this.cache.id;

      const scriptMatches = [...html.matchAll(/<script.*?src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+)"/g)];

      for (const [, scriptUrl] of scriptMatches) {
        const { data: js } = await axios.get(scriptUrl, {
          headers: { 'User-Agent': this.userAgent }
        });

        const idMatch = js.match(/client_id:"([a-zA-Z0-9]{32})"/);
        if (idMatch) {
          this.cache.version = version;
          this.cache.id = idMatch[1];
          return idMatch[1];
        }
      }
    } catch (err) {
      console.error('Gagal ambil client_id:', err.message);
    }
  }

  // Ganti dari searchTracks jadi search
  async search(query, limit = 30) {
    if (!query) throw new Error('Masukkan query pencarian');

    const client_id = await this.getClientID();
    if (!client_id) throw new Error('Gagal mendapatkan client_id');

    const url = 'https://api-v2.soundcloud.com/search/tracks';

    try {
      const response = await axios.get(url, {
        params: { q: query, client_id, limit },
        headers: { 'User-Agent': this.userAgent }
      });

      const anu = response.data.collection.map(track => ({
        id: track.id,
        title: track.title,
        url: track.permalink_url,
        duration: this.#formatDuration(track.full_duration),
        thumbnail: track.artwork_url,
        author: {
          name: track.user.username,
          url: track.user.permalink_url
        },
        like_count: this.#formatNumber(track.likes_count || 0),
        download_count: this.#formatNumber(track.download_count || 0),
        play_count: this.#formatNumber(track.playback_count || 0),
        release_date: this.#formatDate(track.release_date || track.created_at)
      }));
      return { status: true,
               data: anu
             }
    } catch (err) {
      console.error('Gagal mengambil data:', err.message);
      return [];
    }
  }

  // Ganti dari getTrackInfo jadi download
  async download(url) {
    try {
      if (!url.includes('soundcloud.com')) return { error: 'link.invalid' };

      const client_id = await this.getClientID();
      if (!client_id) return { error: 'client_id.not_found' };

      const resolveUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${client_id}`;
      const { data: info } = await axios.get(resolveUrl);

      if (!info.media || !info.media.transcodings) return { error: 'media.not_found' };

      const streamInfo = info.media.transcodings.find(x => x.format.protocol === 'progressive');
      if (!streamInfo) return { error: 'no_downloadable_audio' };

      const streamUrl = `${streamInfo.url}?client_id=${client_id}`;
      const { data: streamData } = await axios.get(streamUrl);

      return {
        status: true,
        data: {
          title: info.title,
          author: info.user?.username || '-',
          url: streamData.url,
          duration: this.#formatDuration(info.duration),
          thumbnail: info.artwork_url || null
        }
      };
    } catch (e) {
      return { error: true, message: e.message };
    }
  }

  // Private utilities
  #formatDuration(ms) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const sisa = sec % 60;
    return `${min}:${sisa.toString().padStart(2, '0')}`;
  }

  #formatNumber(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  }

  #formatDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  }
}

export default new SoundCloudAPI();
