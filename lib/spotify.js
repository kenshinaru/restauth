import axios from 'axios';
import * as cheerio from 'cheerio';

class SpotMate {
  constructor() {
    this._cookie = null;
    this._token = null;
  }

  async _visit() {
    try {
      const response = await axios.get('https://spotmate.online/en', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
        },
      });

      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        this._cookie = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
      }

      const $ = cheerio.load(response.data);
      this._token = $('meta[name="csrf-token"]').attr('content');

      if (!this._token) throw new Error('Token CSRF tidak ditemukan.');
    } catch (error) {
      throw new Error(`Gagal mengunjungi halaman: ${error.message}`);
    }
  }

  async search(q){
		const r = await fetch('https://spotifydown.app/api/metadata?link='+q, {method: 'POST'})
		const data = await r.json()
	        return {
			 status: true,
			 ...data
		}
	}
  
  async detail(q){
		const r = await fetch('https://spotifydown.app/api/metadata?link='+q, {method: 'POST'})
		return r.json();
	}

  async download(spotifyUrl) {
    if (!this._cookie || !this._token) await this._visit();

    try {
      const data = await (await axios.post(
        'https://spotmate.online/convert',
        { urls: spotifyUrl },
        { headers: this._getHeaders() }
      )).data
      const metadata = await this.detail(spotifyUrl)
      delete data.error
      return { 
         status: true, 
	       data : { ...metadata.data, ...data } }
    } catch (error) {
      throw new Error(`Gagal mengonversi track: ${error.message}`);
    } finally {
      this.clear();
    }
  }

  clear() {
    this._cookie = null;
    this._token = null;
  }

  _getHeaders() {
    return {
      'authority': 'spotmate.online',
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'cookie': this._cookie,
      'origin': 'https://spotmate.online',
      'referer': 'https://spotmate.online/en',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
      'x-csrf-token': this._token,
    };
  }
}

export default new SpotMate();
