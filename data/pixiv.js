import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
 
const pixiv = {
    api: {
        base: "https://www.pixiv.net",
        endpoints: {
            search: "/ajax/search/artworks/",
            illust: "/ajax/illust/"
        },
        proxy: "https://api.xiaomiao-ica.top/agent/index.php"
    },

    headers: {
        'accept': 'application/json',
        'referer': 'https://www.pixiv.net/',
        'user-agent': 'Postify/1.0.0',
        'x-requested-with': 'XMLHttpRequest'
    },

    defaults: {
        useProxy: true,
        useBuffer: true, 
        deleteAfterUpload: true,
        cookie: null
    },

    download: async function(url, options = {}) {
        const opt = { ...this.defaults, ...options };
        
        const dlink = opt.useProxy ? this.proxies(url) : url;
        const headers = opt.useProxy ? {} : { 'Referer': 'https://www.pixiv.net/' };
        
        const response = await axios.get(dlink, {
            responseType: 'arraybuffer',
            headers
        });

        const buffer = Buffer.from(response.data, 'binary');
        const result = {
            status: true,
            data: {
            original: url,
            buffer: buffer,
            mime: response.headers['content-type'],
            size: buffer.length
            }
        };

        if (opt.useProxy) {
            result.proxy = dlink;
        }

        return result;
    },
    
    search: async function(query, options = {}) {
        if (!query) {
            return {
                status: false,
                code: 400,
                result: {
                    error: "Querynya mana bree? Mau nyari apaan kalo kagak ada keywordnya 🤨"
                }
            };
        }
        
        if (options.order && !this.isOrder(options.order)) {
            return {
                status: false,
                code: 400,
                result: {
                    error: "Order typenua kagak valid bree, pake aja salah satu ini yak:",
                    valid_orders: this.getOrder()
                }
            };
        }

        try {
            const cookies = await this.getCookies(options.cookie);
            if (!cookies) {
                return {
                    status: false,
                    code: 400,
                    result: {
                        error: "Kukisnya lagi mancing bree 😂 kagak keliatan wkwk"
                    }
                };
            }

            const page = options.page || 1;
            const limit = options.limit || 20;

            const params = {
                word: query,
                order: options.order || 'date_d',
                mode: 'all',
                p: page,
                s_mode: 's_tag_full',
                type: 'all',
                lang: 'en',
                version: options.version || ''
            };

            const { data } = await axios.get(
                this.api.base + "/ajax/search/artworks/" + encodeURIComponent(query), 
                {
                    headers: {
                        ...this.headers,
                        cookie: cookies
                    },
                    params: params
                }
            );

            if (!data.body || !data.body.illustManga || !data.body.illustManga.data) {
                return {
                    status: false,
                    msg: "Kagak nemu apa2 bree buat keyword: " + query 
                    
                };
            }

            const results = data.body.illustManga.data;
            const artworks = [];

            for (const artwork of results.slice(0, limit)) {
                const artworkData = {
                    id: artwork.id,
                    title: artwork.title,
                    type: artwork.illustType === 2 ? 'ugoira' : artwork.illustType === 1 ? 'manga' : 'illustration',
                    description: this.desc(artwork.description),
                    created_at: artwork.createDate,
                    uploaded_at: artwork.uploadDate,
                    urls: {
                        mini: artwork.url,
                        thumb: artwork.url.replace('_p0_master1200', '_p0_master1200'),
                        small: artwork.url.replace('_p0_master1200', '_p0'),
                        regular: artwork.url.replace('_p0_master1200', '_p0'),
                        original: artwork.url.replace('_p0_master1200', '_p0')
                    },
                    stats: {
                        views: artwork.viewCount,
                        bookmarks: artwork.bookmarkCount,
                        likes: artwork.likeCount
                    },
                    artist: {
                        id: artwork.userId,
                        name: artwork.userName,
                        account: artwork.userAccount,
                        profile_url: "https://www.pixiv.net/users/" + artwork.userId
                    },
                    tags: artwork.tags.map(tag => ({
                        name: tag,
                        translated: null
                    }))
                };

                artworks.push(artworkData);
            }

            return {
                status: true,
                data: {
                    query: query,
                    page: page,
                    limit: limit,
                    order: {
                        type: params.order,
                        description: this.orderTypes[params.order]
                    },
                    total: data.body.illustManga.total,
                    artworks: artworks,
                    hasNextPage: data.body.illustManga.hasNextPage,
                    nextPage: data.body.illustManga.hasNextPage ? page + 1 : null
                }
            };

        } catch (error) {
            return {
                status: false,
                msg: error.message
            };
        }
    },
    
    proxies: function(url) {
        return this.api.proxy + "?dns=8.8.8.8&fileUrl=" + encodeURIComponent(url) + "&referer=https://www.pixiv.net";
    },

    getCookies: async function(kukis = null) {
        try {
            if (kukis) {
                return kukis;
            }
            
            const response = await axios.get(this.api.base);
            const setHeaders = response.headers['set-cookie'];
            if (setHeaders) {
                const cookies = setHeaders.map(cookieString => {
                    const cp = cookieString.split(';');
                    const cv = cp[0].trim();
                    return cv;
                });
                return cookies.join('; ');
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    isOrder: function(order) {
        return Object.keys(this.orderTypes).includes(order);
    },

    getOrder: function() {
        const orders = [];
        for (const [key, value] of Object.entries(this.orderTypes)) {
            orders.push({
                type: key,
                description: value
            });
        }
        return orders;
    },

    desc: function(c) {
        if (!c) return '';
        let clean = c.replace(/<[^>]*>/g, '');
        clean = clean.replace(/https?:\/\/[^\s]+/g, '');
        clean = clean.replace(/&[^;]+;/g, '');
        return clean.trim();
    },

    orderTypes: {
        'date_d': 'Terbaru ke Terlama',
        'date': 'Terlama ke Terbaru',
        'popular_d': 'Populer Hari Ini',
        'popular_male_d': 'Populer dari Laki-laki',
        'popular_female_d': 'Populer dari Perempuan'
    }
};
 
export default pixiv
