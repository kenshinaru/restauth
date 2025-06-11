import axios from 'axios';

async function threads(url) {
  if (!url) throw new Error('URL kosong!');
 
  const apiUrl = `https://api.threadsphotodownloader.com/v2/media?url=${encodeURIComponent(url)}`;
  const { data } = await axios.get(apiUrl, {
    headers: {
      'User-Agent': '5.0'
    }
  });
  console.log(data)
 
  return {
    status: true,
    data: {
    image_urls: data.image_urls || [],
    video_urls: data.video_urls || []
    }
  };
}

export default threads
