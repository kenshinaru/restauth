export interface EndpointConfig {
  name: string
  path: string
  params: string[]   
  method: string
  execute: string
}

export interface CategoryConfig {
  category: string
  endpoints: EndpointConfig[]
}

export const ENDPOINT_CATEGORIES: CategoryConfig[] = [
  {
    "category": "downloader",
    "endpoints": [
      {
        "name": "TikTok Search",
        "path": "/ttsearch",
        "params": ["q"],
        "method": "get",
        "execute": "ttsearch"
      },
      {
        "name": "TikTok Downloader",
        "path": "/tiktok",
        "params": ["url"],
        "method": "get",
        "execute": "tiktok"
      },
      {
        "name": "Instagram Downloader",
        "path": "/ig",
        "params": ["url"],
        "method": "get",
        "execute": "instagram"
      },
      {
        "name": "Facebook Downloader",
        "path": "/fb",
        "params": ["url"],
        "method": "get",
        "execute": "instagram"
      },
      {
        "name": "Douyin Search",
        "path": "/douyin-search",
        "params": ["q"],
        "method": "get",
        "execute": "douyin.search"
      },
      {
        "name": "Douyin Downloader",
        "path": "/douyin",
        "params": ["url"],
        "method": "get",
        "execute": "douyin.download"
      },
      {
        "name": "All in One Downloader",
        "path": "/aio",
        "params": ["url"],
        "method": "get",
        "execute": "aio.download"
      },
      {
        "name": "Pixiv Search",
        "path": "/pixiv-search",
        "params": ["q"],
        "method": "get",
        "execute": "pixiv.search"
      },
      {
        "name": "Pixiv Downloader",
        "path": "/pixiv",
        "params": ["url"],
        "method": "get",
        "execute": "pixiv.download"
      },
      {
        "name": "Terabox Downloader",
        "path": "/terabox",
        "params": ["url"],
        "method": "get",
        "execute": "terabox"
      },
      {
        "name": "Threads Downloader",
        "path": "/threads",
        "params": ["url"],
        "method": "get",
        "execute": "threads"
      },
      {
        "name": "Mediafire Downloader",
        "path": "/mediafire",
        "params": ["url"],
        "method": "get",
        "execute": "mediafire"
      },
      {
        "name": "Google Drive Downloader",
        "path": "/gdrive",
        "params": ["url"],
        "method": "get",
        "execute": "gdrive.download"
      },
      {
        "name": "Krakenfile Downloader",
        "path": "/krakenfile",
        "params": ["url"],
        "method": "get",
        "execute": "kraken"
      },
      {
        "name": "Twitter Downloader",
        "path": "/twitter",
        "params": ["url"],
        "method": "get",
        "execute": "twitter"
      },
      {
        "name": "Spotify Downloader",
        "path": "/spotify",
        "params": ["url"],
        "method": "get",
        "execute": "spotify.download"
      },
      {
        "name": "Spotify Search",
        "path": "/spotify-search",
        "params": ["q"],
        "method": "get",
        "execute": "spotify.search"
      },
      {
        "name": "Pinterest Downloader",
        "path": "/pin",
        "params": ["url"],
        "method": "get",
        "execute": "pinterest.download"
      },
      {
        "name": "Pinterest Search",
        "path": "/pinterest",
        "params": ["q"],
        "method": "get",
        "execute": "pinterest.search"
      },
      {
        "name": "Apk Downloader",
        "path": "/apk",
        "params": ["id"],
        "method": "get",
        "execute": "apk.download"
      },
      {
        "name": "Apk Search",
        "path": "/apk-search",
        "params": ["q"],
        "method": "get",
        "execute": "apk.search"
      },
      {
        "name": "Sfile Downloader",
        "path": "/sfile",
        "params": ["url"],
        "method": "get",
        "execute": "sfile"
      },
      {
        "name": "SnackVideo Downloader",
        "path": "/snackvideo",
        "params": ["url"],
        "method": "get",
        "execute": "snackvideo"
      },
      {
        "name": "CapCut Template Downloader",
        "path": "/capcut",
        "params": ["url"],
        "method": "get",
        "execute": "capcut"
      },
      {
        "name": "YouTube Play",
        "path": "/play",
        "params": ["q"],
        "method": "get",
        "execute": "youtube.play"
      },
      {
        "name": "YouTube to MP4",
        "path": "/ytmp4",
        "params": ["url", "quality"],
        "method": "get",
        "execute": "youtube.download"
      },
      {
        "name": "YouTube to MP3",
        "path": "/ytmp3",
        "params": ["url", "quality"],
        "method": "get",
        "execute": "youtube.download"
      },
      {
        "name": "Search Lyric",
        "path": "/lyric",
        "params": ["q"],
        "method": "get",
        "execute": "genius"
      },
      {
        "name": "SoundCloud Downloader",
        "path": "/soundcloud",
        "params": ["url"],
        "method": "get",
        "execute": "soundcloud.download"
      },
      {
        "name": "SoundCloud Search",
        "path": "/soundcloud-search",
        "params": ["q"],
        "method": "get",
        "execute": "soundcloud.search"
      }
    ]
  },
  {
    "category": "tools",
    "endpoints": [
      {
        "name": "TikTok Stalker",
        "path": "/ttstalk",
        "params": ["username"],
        "method": "get",
        "execute": "ttstalk"
      },
      {
        "name": "Instagram Stalker",
        "path": "/igstalk",
        "params": ["username"],
        "method": "get",
        "execute": "igstalk"
      },
      {
        "name": "Youtube Stalker",
        "path": "/ytstalk",
        "params": ["username"],
        "method": "get",
        "execute": "ytstalk"
      },
      {
        "name": "Screenshot Website",
        "path": "/ssweb",
        "params": ["url", "device"],
        "method": "get",
        "execute": "ssweb"
      },
      {
        "name": "Webp to Jpg",
        "path": "/tojpg",
        "params": ["url"],
        "method": "get",
        "execute": "tojpg"
      },
      {
        "name": "Webp to Mp4",
        "path": "/tomp4",
        "params": ["url"],
        "method": "get",
        "execute": "tomp4"
      },
      {
        "name": "Image Enhance",
        "path": "/remini",
        "params": ["url"],
        "method": "get",
        "execute": "remini.Remini"
      },
      {
        "name": "Remove Watermark",
        "path": "/removewm",
        "params": ["url"],
        "method": "get",
        "execute": "remini.Remove"
      },
      {
        "name": "Removal AI",
        "path": "/removebg",
        "params": ["url"],
        "method": "get",
        "execute": "removebg.remove"
      }
    ]
  },
  {
    "category": "gateway",
    "endpoints": [
      {
        "name": "Create Payment",
        "path": "/payment",
        "params": ["id", "amount"],
        "method": "get",
        "execute": "payment.createPay"
      },
      {
        "name": "Check Payment",
        "path": "/paycek",
        "params": ["merchant", "apikey", "token"],
        "method": "get",
        "execute": "payment.checkPay"
      }
    ]
  },
  {
    "category": "maker",
    "endpoints": [
      {
        "name": "Brat Image Generator",
        "path": "/brat",
        "params": ["q"],
        "method": "get",
        "execute": "brat.image"
      },
      {
        "name": "Brat Video Generator",
        "path": "/brat-vid",
        "params": ["q"],
        "method": "get",
        "execute": "brat.video"
      },
      {
        "name": "Quote Generator",
        "path": "/qc",
        "params": ["q", "username", "avatar"],
        "method": "get",
        "execute": "quote"
      }
    ]
  },
  {
    "category": "internet",
    "endpoints": [
      {
        "name": "Chord Guitar",
        "path": "/chord",
        "params": ["q"],
        "method": "get",
        "execute": "chord"
      },
      {
        "name": "News Tempo",
        "path": "/tempo",
        "params": ["q"],
        "method": "get",
        "execute": "tempo"
      },
      {
        "name": "Wikipedia",
        "path": "/wikipedia",
        "params": ["q"],
        "method": "get",
        "execute": "wikipedia"
      },
      {
        "name": "Cari Kodepos",
        "path": "/kodepos",
        "params": ["q"],
        "method": "get",
        "execute": "kodepos"
      }
    ]
  },
  {
    "category": "artificial intelligence",
    "endpoints": [
      {
        "name": "Blackbox AI",
        "path": "/blackbox",
        "params": ["q"],
        "method": "get",
        "execute": "blackbox"
      },
      {
        "name": "Chatbot session",
        "path": "/chatbot",
        "params": ["session", "q", "system", "url"],
        "method": "get",
        "execute": "gemini.generateContent"
      },
      {
        "name": "AI Copilot",
        "path": "/copilot",
        "params": ["q"],
        "method": "get",
        "execute": "copilot.chat"
      },
      {
        "name": "Gemini Chat",
        "path": "/gemini",
        "params": ["q"],
        "method": "get",
        "execute": "gemini.chat"
      },
      {
        "name": "Gemini Vision",
        "path": "/gemini-vision",
        "params": ["q", "url"],
        "method": "get",
        "execute": "gemini.file"
      },
      {
        "name": "DeepSeek R1",
        "path": "/deepseek",
        "params": ["q"],
        "method": "get",
        "execute": "deepseek.chat"
      },
      {
        "name": "Flux Image",
        "path": "/flux",
        "params": ["q", "width", "height"],
        "method": "get",
        "execute": "gemini.imagen"
      },
      {
        "name": "Imagen 3.5",
        "path": "/imagen",
        "params": ["q"],
        "method": "get",
        "execute": "imagen"
      },
      {
        "name": "Photo Editor AI",
        "path": "/aieditor",
        "params": ["url", "q"],
        "method": "get",
        "execute": "gemini.editImg"
      },
      {
        "name": "GPT 4.1 Mini",
        "path": "/gpt4.1-mini",
        "params": ["q"],
        "method": "get",
        "execute": "gpt.chat"
      }
    ]
  }
]
