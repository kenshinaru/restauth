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

async function anu(text, username, avatar) {
  const data = {
    type: "quote",
    format: "png",
    backgroundColor: "#252525",
    width: 512,
    height: 768,
    scale: 2,
    messages: [{
      entities: [],
      avatar: true,
      from: {
        id: 1,
        name: username,
        photo: {
          url: avatar
        }
      },
      text: text,
      replyMessage: {}
    }]
  };

  try {
    const res = await axios.post('https://s.neoxr.eu/api/generate', data, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'application/json' }
    });

    const buffer = Buffer.from(res.data);
    const filename = `quote-${Date.now()}.png`;
    const uploaded = await uploadBuffer(buffer, filename);

    if (!uploaded.status) return uploaded;

    return {
      status: true,
      data: {
        ...uploaded.data
      }
    };
  } catch (error) {
    return {
      status: false,
      msg: error.message
    };
  }
}

export default anu;
