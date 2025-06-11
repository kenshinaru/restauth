/**
 * TikTok scraper function
 * @param {string} url - The TikTok URL to scrape
 * @returns {Promise<Object>} - The scraped data
 */
export default async function tiktok(url) {
  try {
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.data) {
      throw new Error("No data received from TikTok API")
    }

    return {
      status: true,
      data: {
        id: result.data.id,
        author: {
          nickname: result.data.author?.nickname,
          uniqueId: result.data.author?.unique_id,
        },
        statistic: {
          views: result.data.play_count,
          likes: result.data.digg_count,
          comments: result.data.comment_count,
          shares: result.data.share_count,
          saved: result.data.collect_count,
        },
        published: result.data.create_time,
        music: {
          title: result.data.music_info?.title,
          author: result.data.music_info?.author,
          duration: result.data.music_info?.duration,
          original: result.data.music_info?.original,
          copyright: false,
        },
        caption: result.data.title,
        video: result.data.play,
        videoWM: result.data.wmplay,
        audio: result.data.music,
        photo: result.data.images,
      },
    }
  } catch (error) {
    return {
      status: false,
      error: "TikTok scraper error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
