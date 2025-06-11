import axios from 'axios'
import * as cheerio from 'cheerio'

const wikisearch = async (query) => {
  try {
    const searchResponse = await axios.get(
      `https://id.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=1&srsearch=${encodeURIComponent(query)}`
    );

    const pageId = searchResponse.data.query.search[0].pageid;

    const pageResponse = await axios.get(`https://id.wikipedia.org/?curid=${pageId}`);
    const $ = cheerio.load(pageResponse.data);

    let json = {};
    $("script[type='application/ld+json']").each((_, el) => {
      const data = $(el).html();
      if (data) json = JSON.parse(data);
    });

    let context = '';
    const paragraphs = $('.mw-parser-output > p').not('.coordinates');

    for (let i = 0; i < paragraphs.length; i++) {
      const p = $(paragraphs[i]);
      p.find('sup, .noprint, .reference, .IPA-label-small, .mw-parser-output, span[style], .navbox, .infobox').remove();

      let text = p.text().trim()
        .replace(/\.mw-parser-output[^}]*}/g, '')
        .replace(/\{[^}]*\}/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\([^)]*font-size[^)]*\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length > 50) {
        context = text;
        break;
      }
    }

    if (!context) {
      let allText = $('.mw-parser-output p').first().clone();
      allText.find('*').remove();
      context = allText.text().trim();
    }

    context = context
      .replace(/\.mw-parser-output[^:]*:/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\([^)]*font-size[^)]*\)[^;]*;/g, '')
      .replace(/Indonesia:\s*\[[^\]]*\];/g, 'Indonesia:')
      .replace(/\s*;\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      status: true,
      data: {
      title: json.headline || query,
      url: json.url,
      publisher: json.publisher?.name || 'Wikipedia',
      datePublished: json.datePublished,
      thumbnail: json.image || json.publisher?.logo?.url,
      context,
      }
    };
  } catch (error) {
    throw error;
  }
};

export default wikisearch
