import { LRUCache } from "lru-cache"
import { CONFIG } from "@/config/setting"

type RateInfo = {
  count: number
  resetTime: number
}

const cache = new LRUCache<string, RateInfo>({
  max: 1000, 
  ttl: CONFIG.RATE_LIMIT.WINDOW_MS,
})

export function checkIpRateLimit(request: Request) {
  const headers = request.headers
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"

  const key = `rl:${ip}`
  const now = Date.now()
  const maxRequests = CONFIG.RATE_LIMIT.MAX_REQUESTS
  const windowMs = CONFIG.RATE_LIMIT.WINDOW_MS

  const existing = cache.get(key)

  if (!existing || now > existing.resetTime) {
    const resetTime = now + windowMs
    cache.set(key, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
      total: maxRequests,
    }
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      total: maxRequests,
    }
  }

  existing.count++
  cache.set(key, existing)

  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime,
    total: maxRequests,
  }
}
