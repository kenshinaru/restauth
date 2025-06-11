import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

export default async function kodepos(kota) {
  try {
    const url = `https://carikodepos.com/?s=${encodeURIComponent(kota)}`;

    const agent = new https.Agent({
      rejectUnauthorized: false, // Abaikan SSL verification
    });

    const { data: body } = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });

    const $ = cheerio.load(body);
    const rows = $('tr').slice(1); // Skip header row

    if (!rows.length) throw new Error('No result could be found');

    const results = [];

    rows.each((_, el) => {
      const td = $(el).find('td');
      const result = {};

      td.each((j, cell) => {
        const value = $(cell).find('a').html();
        const key = 
          j === 0 ? 'province' :
          j === 1 ? 'city' :
          j === 2 ? 'subdistrict' :
          j === 3 ? 'urban' :
          'postalcode';
        result[key] = value;
      });

      results.push(result);
    });

    return {
      status: true,
      data: results, // <-- Array, clean, no index keys
    };
  } catch (err) {
    console.error('Error fetching kodepos:', err.message);
    return {
      status: false,
      data: [],
      message: err.message,
    };
  }
}
