async function getInstagramInfo(username) {
    const url = `https://instagram-scraper-20252.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`;

    const options = {
        method: 'GET',
        headers: {
            'Accept-Encoding': 'gzip',
            'Connection': 'Keep-Alive',
            'Host': 'instagram-scraper-20252.p.rapidapi.com',
            'User-Agent': 'okhttp/3.14.9',
            'x-rapidapi-host': 'instagram-scraper-20252.p.rapidapi.com',
            'x-rapidapi-key': 'd90d10e212msh62e06c30b13b48ep100e02jsnabc6709af5ec'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        const data = json.data;

        const formattedData = {
            name: data.full_name || null,
            username: data.username || null,
            posts: data.media_count ?? null,
            followers: data.follower_count ?? null,
            followings: data.following_count ?? null,
            bio: data.biography || null,
            private: data.is_private ?? null,
            photo: data.hd_profile_pic_url_info?.url || null
        };

        return {
            status: true,
            data: formattedData
        }
    } catch (error) {
        console.error('Error fetching Instagram info:', error);
        return null;
    }
}


export default getInstagramInfo
