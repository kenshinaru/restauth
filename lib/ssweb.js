import axios from 'axios';
import FormData from 'form-data';


const uploadBuffer = async (input) => {
  try {
    
    const form = new FormData();
    form.append('file', input, `screenshot-${Date.now()}.png`);
    form.append('expiration', '5min');

    const { data } = await axios.post('https://cdn-arincy.vercel.app/api/upload', form, {
      headers: form.getHeaders()
    });

    if (!data?.status) throw new Error(data?.msg || 'Upload gagal');

    return data;
  } catch (e) {
    return { creator: 'Luthfi Joestars', status: false, msg: e.message };
  }
};

const ssweb = async (url, device) => {
  const baseURL = 'https://www.screenshotmachine.com';
  const param = {
    url: url,
    device: device,
    cacheLimit: 0
  };

  try {
    const captureRes = await axios({
      url: baseURL + '/capture.php',
      method: 'POST',
      data: new URLSearchParams(Object.entries(param)),
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    if (captureRes.data.status !== 'success') {
      throw new Error('Gagal mengambil screenshot');
    }

    const cookies = captureRes.headers['set-cookie'];
    const imageRes = await axios.get(baseURL + '/' + captureRes.data.link, {
      headers: {
        'cookie': cookies?.join('') || ''
      },
      responseType: 'arraybuffer'
    });

    const anu = await uploadBuffer(Buffer.from(imageRes.data));
   return { 
         status: true,
         data: {
               url: anu.data.url,
               device: device
            }
        }
  } catch (e) {
    return { creator: 'Luthfi Joestars', status: false, msg: e.message };
  }
}

export default ssweb
