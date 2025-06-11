import * as cheerio from 'cheerio'
import moment from 'moment-timezone'
import axios from 'axios'

const search = async (query) => {
    const response = await fetch("https://www.pinterest.com/resource/BaseSearchResource/get/?data=" + encodeURIComponent('{"options":{"query":"' + encodeURIComponent(query) + '"}}'), {
        "headers": {
            "screen-dpr": "4",
            "x-pinterest-pws-handler": "www/search/[scope].js",
        },
        "method": "head"
    })
    if (!response.ok) throw Error (`error ${response.status} ${response.statusText}`)
    const rhl = response.headers.get("Link")
    if (!rhl) throw Error (`hasil pencarian ${prompt} kosong`)
    const links = [ ...rhl.matchAll(/<(.*?)>/gm)].map(v => v[1])
    return {
        status: true,
        data: links
    }
}
 

const download = async(url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
        }).catch((e) => e.response);

        const $ = cheerio.load(response.data);
        const tag = $('script[data-test-id="video-snippet"]');

        if (tag.length > 0) {
            const result = JSON.parse(tag.text());
            if (!result || !result.name || !result.thumbnailUrl || !result.uploadDate || !result.creator) {
                return { msg: "- Data tidak ditemukan, coba pakai url lain" };
            }
            const url = result.contentUrl;
            const match = url.match(/\.(mp4|mp3|gif)(\?.*)?$/i);
                
            return {
                status: true,
                data: {
                url: url,
                type: match ? match[1].toLowerCase() : null,
                title: result.name,
                thumb: result.thumbnailUrl,
                upload: new Date(result.uploadDate).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                }),
                source: result["@id"],
                author: {
                    name: result.creator.alternateName,
                    username: "@" + result.creator.name,
                    url: result.creator.url,
                },
                keyword: result.keywords ? result.keywords.split(", ").map((keyword) => keyword.trim()) : [],
                }
            };
        } else {
            const json = JSON.parse($("script[data-relay-response='true']").eq(0).text());
            const result = json.response.data["v3GetPinQuery"].data;
            const url = result.imageLargeUrl;
            const match = url.match(/\.(mp4|mp3|gif)(\?.*)?$/i);
                
            return {
                status: true,
                data: {
                url: url,
                type: match ? match[1].toLowerCase() : null,
                title: result.title,
                upload: new Date(result.createAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                }),
                source: result.link,
                author: {
                    name: result.pinner.username,
                    username: "@" + result.pinner.username,
                },
                keyword: result.pinJoin.visualAnnotation,
            }
          }
        }
    } catch (e) {
        return { msg: "Error coba lagi nanti" };
    }
}

export default { search, download }
