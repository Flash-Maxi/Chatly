import rateLimit from "express-rate-limit"

// ─────────────────────────────────────────────────────────────────────────────
// Shared handler options
//   standardHeaders: true  → sends RateLimit-* headers (RFC draft 7)
//   legacyHeaders:   false → suppresses deprecated X-RateLimit-* headers
// ─────────────────────────────────────────────────────────────────────────────
const sharedOptions = {
  standardHeaders: true,
  legacyHeaders: false,
}

// ─── 1. authLimiter ───────────────────────────────────────────────────────────
// Protects: /signup, /login, /verify-otp, /resend-otp, /forgot-password,
//           /reset-password
// Tight window (15 min / 5 req) to slow down brute-force and credential
// stuffing attacks on the most sensitive endpoints.
export const authLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    })
  },
})

// ─── 2. messageLimiter ────────────────────────────────────────────────────────
// Protects: POST /api/message/send/:receiver
// Allows up to 60 messages per minute per IP — generous for real-time chat
// but still blocks any script flooding the send endpoint.
export const messageLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many messages sent. Please slow down and try again in a minute.",
    })
  },
})

// ─── 3. searchLimiter ─────────────────────────────────────────────────────────
// Protects: GET /api/user/search
// Search is DB-read-heavy; 30 req/min is more than enough for a human user
// and prevents automated enumeration of usernames.
export const searchLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many search requests. Please try again in a minute.",
    })
  },
})

// ─── 4. uploadLimiter ─────────────────────────────────────────────────────────
// Protects: PUT /api/user/profile (profile image) and
//           POST /api/message/send/:receiver when it carries a file (image).
// Uploads consume bandwidth + Cloudinary API quota; 20 per 10 min is generous
// for legitimate use while blocking bulk upload abuse.
export const uploadLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many upload requests. Please try again in 10 minutes.",
    })
  },
})

// ─── 5. generalLimiter ────────────────────────────────────────────────────────
// Applied globally to all HTTP routes as a catch-all safety net.
// 300 req / 15 min is very permissive for normal usage but still stops
// aggressive crawlers and DoS scripts.
// NOTE: This is applied BEFORE specific limiters in index.js so that specific
// routes see their own stricter limiter first AND are also counted toward the
// global budget.
export const generalLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    })
  },
})
