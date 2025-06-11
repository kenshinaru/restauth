import * as cheerio from 'cheerio';

const BASE_URL = "https://api.genius.com";
const ACCESS_TOKEN = "5A3jmNtHiCmWSmKZYfoM_T5seFaHnZiTwzIxCsHJqF7JXauBIDLocGmo9wFFzLNX";

// Fungsi pencarian lirik
async function searchLyric(query) {
  try {
    const response = await fetch(`${BASE_URL}/search?access_token=${ACCESS_TOKEN}&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const result = await response.json();
    const hits = result.response.hits;

    return {
      status: true,
      data: hits.length > 0
        ? hits.map(hit => ({
            title: hit.result.title,
            url: hit.result.url,
            artist: hit.result.artist_names
          }))
        : []
    };
  } catch (error) {
    console.error('Error during search:', error);
    return {
      status: false,
      data: []
    };
  }
}

// Fungsi ambil lirik dari halaman
async function getLyrics(url) {
  try {
    const response = await fetch("https://files.xianqiao.wang/" + url);
    const html = await response.text();
    const $ = cheerio.load(html);

    let lyrics = '';
    $('div[class^="Lyrics__Container"]').each((_, elem) => {
      if ($(elem).text().length !== 0) {
        const snippet = $(elem).html()
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
        lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
      }
    });

    return {
      status: true,
      data: lyrics.trim()
    };
  } catch (error) {
    console.error('Error while scraping lyrics:', error);
    return {
      status: false,
      data: ''
    };
  }
}

export default { searchLyric, getLyrics };
