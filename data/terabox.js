import axios from 'axios';

/**
 * Mengambil data file dari URL Terabox
 * @param {string} url - URL dari Terabox (contoh: https://teraboxapp.com/s/xxx)
 * @returns {Promise<{status: boolean, data?: any, message?: string}>}
 */

export default async function terabox(url) {
  const match = url?.match(/https?:\/\/\w+\.(?:com|app)\/s\/([^/]+)/);
  if (!match) throw new Error('URL tidak valid');

  const id = match[1];

  try {
    const tokenRes = await axios.get('https://teraboxdl.site/api/token', {
      headers: {
        'user-agent': 'Postify/1.0.0',
        'referer': 'https://teraboxdl.site/'
      }
    });

    const token = tokenRes.data.token;
    if (!token) throw new Error('Gagal mendapatkan token');

    const teraboxRes = await axios.get('https://teraboxdl.site/api/terabox', {
      headers: {
        'user-agent': 'Postify/1.0.0',
        'referer': 'https://teraboxdl.site/',
        'x-access-token': token
      },
      params: {
        url: `https://1024terabox.com/s/${id}`
      }
    });

    const result = teraboxRes.data;
    if (result?.data?.all_files) {
      return { status: true, data: result.data.all_files };
    }

    return { status: false, message: 'Request gagal' };
  } catch (err) {
    throw new Error('Terjadi kesalahan saat memproses: ' + err.message);
  }
}
