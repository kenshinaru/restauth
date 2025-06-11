import * as cheerio from 'cheerio';

const BASE_URL = "https://api.genius.com";
const ACCESS_TOKEN = "5A3jmNtHiCmWSmKZYfoM_T5seFaHnZiTwzIxCsHJqF7JXauBIDLocGmo9wFFzLNX";

async function getLyricsByQuery(query) {
  try {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    const json = await res.json();
    const hit = json.response.hits?.[0];
    if (!hit) return { status: false, message: "Lagu tidak ditemukan." };

    const { title, artist_names: artist, url } = hit.result;
    const htmlRes = await fetch("https://files.xianqiao.wang/" + url);
    const html = await htmlRes.text();

    const $ = cheerio.load(html);
    let lyrics = '';
    $('div[class^="Lyrics__Container"]').each((_, el) => {
      const raw = $(el).html()
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<(?!br)[^>]+>/g, '');
      lyrics += $('<textarea>').html(raw).text().trim() + '\n\n';
    });

    return {
      status: true,
      data: {
        title,
        artist,
        url,
        lyrics: lyrics.trim()
      }
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
}

export default getLyricsByQuery
