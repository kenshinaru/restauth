import axios from 'axios';
import * as cheerio from 'cheerio';
import vm from 'vm';

class DouyinSearchPage {
    constructor() {
        this.baseURL = 'https://so.douyin.com/';
        this.cookies = {};
        this.defaultParams = {
            search_entrance: 'aweme',
            enter_method: 'normal_search',
            innerWidth: '431',
            innerHeight: '814',
            reloadNavStart: String(Date.now()),
            is_no_width_reload: '1',
            keyword: '',
        };

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'accept-language': 'id-ID,id;q=0.9',
                'referer': 'https://so.douyin.com/',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
            },
        });

        this.api.interceptors.response.use(res => {
            const setCookies = res.headers['set-cookie'];
            if (setCookies) {
                setCookies.forEach(c => {
                    const [name, value] = c.split(';')[0].split('=');
                    if (name && value) this.cookies[name] = value;
                });
            }
            return res;
        });

        this.api.interceptors.request.use(config => {
            if (Object.keys(this.cookies).length) {
                config.headers['Cookie'] = Object.entries(this.cookies)
                    .map(([k, v]) => `${k}=${v}`)
                    .join('; ');
            }
            return config;
        });
    }

    async initialize() {
        await this.api.get('/');
    }

    extractAudioUrl(videoUrl) {
        try {
            return videoUrl
                .replace(/\.mp4$/i, '.mp3')
                .replace(/video/, 'audio')
                .replace(/ve-/, 'au-');
        } catch {
            return null;
        }
    }

    formatAwemeData(awemeInfo) {
        if (!awemeInfo) return null;

        const video = awemeInfo.video || {};
        const getFirstUrl = obj => obj?.url_list?.[0] || null;

        const videoUrls = {
            playUrl: getFirstUrl(video.play_addr),
            downloadUrl: getFirstUrl(video.download_addr),
            hdUrl: getFirstUrl(video.play_addr_h264),
            watermarkUrl: getFirstUrl(video.play_addr_lowbr),
        };

        const baseData = {
            id: awemeInfo.aweme_id,
            title: awemeInfo.desc || '',
            author: {
                username: awemeInfo.author?.unique_id || '',
                nickname: awemeInfo.author?.nickname || '',
                verified: awemeInfo.author?.is_verified || false,
                avatar: getFirstUrl(awemeInfo.author?.avatar_thumb),
            },
            stats: {
                likes: awemeInfo.statistics?.digg_count || 0,
                comments: awemeInfo.statistics?.comment_count || 0,
                shares: awemeInfo.statistics?.share_count || 0,
                views: awemeInfo.statistics?.play_count || 0,
            },
            createTime: awemeInfo.create_time
                ? new Date(awemeInfo.create_time * 1000).toLocaleString()
                : '',
            pageUrl: `https://www.douyin.com/video/${awemeInfo.aweme_id}`,
            tags: (awemeInfo.text_extra || [])
                .map(t => t.hashtag_name)
                .filter(Boolean),
            cover: getFirstUrl(video.cover),
        };

        if (awemeInfo.duration && awemeInfo.duration > 0) {
            baseData.video = videoUrls.playUrl || videoUrls.hdUrl;
            baseData.videoWM = videoUrls.downloadUrl;
            baseData.audio = this.extractAudioUrl(videoUrls.downloadUrl || videoUrls.playUrl);
            baseData.duration = `${Math.floor(awemeInfo.duration / 1000)}s`;
        } else if (awemeInfo.images?.length) {
            baseData.photo = awemeInfo.images.map(img => getFirstUrl(img)).filter(Boolean);
            baseData.cover = baseData.photo[0] || baseData.cover;
        }

        return baseData;
    }

    async search(query) {
        await this.initialize();

        const params = {
            ...this.defaultParams,
            keyword: query,
            reloadNavStart: String(Date.now()),
        };

        const res = await this.api.get('s', { params });
        const $ = cheerio.load(res.data);

        const scriptTag = $('script')
            .toArray()
            .map(el => $(el).html())
            .find(txt => txt.includes('let data =') && txt.includes('"business_data":'));

        if (!scriptTag) throw new Error('Data script not found');

        const match = scriptTag.match(/let\s+data\s*=\s*(\{[\s\S]+?\});/);
        if (!match) throw new Error('Data object not matched');

        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext(`data = ${match[1]}`, sandbox);

        const awemeList = sandbox.data?.business_data
            ?.map(entry => entry?.data?.aweme_info)
            .filter(Boolean);

        const results = awemeList.map(item => this.formatAwemeData(item)).filter(Boolean);

        return {
            query,
            totalResults: results.length,
            results,
        };
    }

    async download(url) {
        const apiUrl = 'https://lovetik.app/api/ajaxSearch';
        const formBody = new URLSearchParams({ q: url, lang: 'id' });

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': '*/*',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formBody.toString(),
        });

        const result = await response.json();
        if (result.status !== 'ok') {
            throw new Error('Failed to fetch video data');
        }

        const $ = cheerio.load(result.data);
        return {
            status: true,
            data: {
                title: $('h3').text(),
                thumbnail: $('.image-tik img').attr('src'),
                duration: $('.content p').text(),
                url: $('.dl-action a')
                    .map((_, el) => ({
                        text: $(el).text().trim(),
                        url: $(el).attr('href'),
                    }))
                    .get(),
            },
        };
    }
}

export default new DouyinSearchPage()
