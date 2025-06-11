import * as cheerio from 'cheerio'

export default async function anu (url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('title').text();
  const video = $('video').attr('src');
  const thumbnail = $('video').attr('poster');
  const caption = $('.desc-detail').text();
  const author = $('.author-name').text();
  const usageText = $('.actions-detail').text();
  const [date, uses, likes] = usageText.split(',').map(s => s.trim());

  return {
    status: true,
    data: {
    title,
    author,
    caption,
    video,
    thumbnail,
    stats: {
          date,
          uses,
          likes
        }
     }
  };
};
