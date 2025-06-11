import axios from 'axios';
import FormData from 'form-data';

const removalAi = {
  api: {
    base: 'https://removal.ai',
    remove: 'https://api.removal.ai',
    endpoint: {
      webtoken: '/wp-admin/admin-ajax.php',
      remove: '/3.0/remove',
      slug: '/upload/',
    },
  },

  headers: { 'user-agent': 'Postify/1.0.0' },

  isUrl: async (link) => {
    if (!link || !/^https?:\/\/.+\/.+$/.test(link)) {
      return {
        status: false,
        msg: 'Tautan gambar tidak ditemukan atau tidak valid.',
      };
    }

    try {
      const response = await axios.get(link, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'];

      if (!contentType?.startsWith('image/')) {
        return {
          status: false,
          msg: 'Tautan yang diberikan bukan merupakan gambar.',
        };
      }

      const buffer = Buffer.from(response.data);
      if (buffer.length > 5 * 1024 * 1024) {
        return {
          status: false,
          msg: 'Ukuran file gambar melebihi batas maksimum 5MB.',
        };
      }

      return {
        status: true,
        buffer,
        fileName: link.split('/').pop().split('#')[0].split('?')[0],
        type: contentType,
      };
    } catch (err) {
      return {
        status: false,
        msg: 'Tidak dapat mengakses gambar dari tautan yang diberikan.',
      };
    }
  },

  getSecurity: async () => {
    try {
      const response = await axios.get(`${removalAi.api.base}${removalAi.api.endpoint.slug}`);
      const match = response.data.match(/ajax_upload_object = (.*?);/);

      if (!match) {
        return {
          status: false,
          msg: 'Token keamanan tidak ditemukan dalam respons server.',
        };
      }

      return {
        status: true,
        security: JSON.parse(match[1]).security,
      };
    } catch (err) {
      return {
        status: false,
        msg: 'Gagal mengambil token keamanan dari server.',
      };
    }
  },

  getWebToken: async (security) => {
    if (!security) {
      return {
        status: false,
        msg: 'Token keamanan tidak tersedia.',
      };
    }

    try {
      const response = await axios.get(`${removalAi.api.base}${removalAi.api.endpoint.webtoken}`, {
        params: { action: 'ajax_get_webtoken', security },
        headers: {
          ...removalAi.headers,
          Referer: `${removalAi.api.base}${removalAi.api.endpoint.slug}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.data.success) {
        return {
          status: false,
          msg: 'Permintaan web token ditolak oleh server.',
        };
      }

      return {
        status: true,
        webtoken: response.data.data.webtoken,
      };
    } catch (err) {
      return {
        status: false,
        msg: 'Gagal mendapatkan web token dari server.',
      };
    }
  },

  remove: async (link) => {
    const img = await removalAi.isUrl(link);
    if (!img.status) return { status: false, msg: img.msg };

    const sec = await removalAi.getSecurity();
    if (!sec.status) return { status: false, msg: sec.msg };

    const token = await removalAi.getWebToken(sec.security);
    if (!token.status) return { status: false, msg: token.msg };

    try {
      const formData = new FormData();
      formData.append('image_file', img.buffer, {
        filename: img.fileName,
        contentType: img.type,
      });

      const response = await axios.post(
        `${removalAi.api.remove}${removalAi.api.endpoint.remove}`,
        formData,
        {
          headers: {
            ...removalAi.headers,
            authority: 'api.removal.ai',
            origin: removalAi.api.base,
            'web-token': token.webtoken,
            ...formData.getHeaders(),
          },
        }
      );

      const { status, ...resx } = response.data;
      return { status: true, data: resx };
    } catch (err) {
      return {
        status: false,
        msg: 'Terjadi kesalahan saat memproses penghapusan latar belakang gambar.',
      };
    }
  },
};

export default removalAi;
