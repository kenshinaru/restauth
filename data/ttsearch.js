const asupan = async (query) => {
  try {
    const formData = new URLSearchParams();
    formData.append("keywords", query);
    formData.append("count", 12);
    formData.append("cursor", 0);
    formData.append("hd", 1);

    const response = await fetch("https://tikwm.com/api/feed/search", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "cookie": "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      },
      body: formData
    });

    const result = await response.json();

    const videos = result.data.videos;
    if (!videos || videos.length === 0) {
      throw new Error("No videos found");
    }

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    return {
      status: true,
      data: {
      caption: randomVideo.title,
      author: { ...randomVideo.author, username: randomVideo.author.unique_id },
      stats: {
        play_count: randomVideo.play_count,
        digg_count: randomVideo.digg_count,
        share_count: randomVideo.share_count,
        comment_count: randomVideo.comment_count,
      },
      music: randomVideo.music_info,
      duration: randomVideo.duration,
      video: randomVideo.play,
      }
    };
  } catch (err) {
    throw err;
  }
};

export default asupan
