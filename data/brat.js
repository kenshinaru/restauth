import axios from 'axios';
import FormData from 'form-data';

async function uploadBuffer(input, filename) {
  try {
    const form = new FormData();
    form.append('file', input, filename);
    form.append('expiration', '5min');

    const { data } = await axios.post('https://cdn-arincy.vercel.app/api/upload', form, {
      headers: form.getHeaders()
    });

    if (!data?.status) throw new Error(data?.msg || 'Upload gagal');

    return {
      status: true,
      data: {
        url: data.data.url,
        filename
      }
    };
  } catch (e) {
    return {
      status: false,
      msg: e.message
    };
  }
}

async function image(text) {
  const url = `https://r-clair.hf.space/api/brat?q=${encodeURIComponent(text)}&video=false`;
  const filename = `brat-image-${Date.now()}.png`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const uploaded = await uploadBuffer(buffer, filename);

    if (!uploaded.status) return uploaded;

    return {
      status: true,
      data: {
        ...uploaded.data,
        type: 'image'
      }
    };
  } catch (err) {
    return {
      status: false,
      msg: err.message
    };
  }
}

async function video(text) {
  const url = `https://r-clair.hf.space/api/brat?q=${encodeURIComponent(text)}&video=true`;
  const filename = `brat-video-${Date.now()}.mp4`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const uploaded = await uploadBuffer(buffer, filename);

    if (!uploaded.status) return uploaded;

    return {
      status: true,
      data: {
        ...uploaded.data,
        type: 'video'
      }
    };
  } catch (err) {
    return {
      status: false,
      msg: err.message
    };
  }
}

export default { image, video };
