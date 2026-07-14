import express from "express"
import dotenv from "dotenv"
import multer from "multer"
dotenv.config()
console.log("INDEX EMAIL_HOST:", process.env.EMAIL_HOST);

import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import { app, server } from "./socket/socket.js"
import { generalLimiter } from "./middlewares/rateLimiter.js"

const port = process.env.PORT || 3000


// trust proxy: required on Render (and most cloud platforms) so that
// express-rate-limit reads the real client IP from X-Forwarded-For
// instead of the internal load-balancer IP (which would make all users
// share one rate-limit bucket).
app.set('trust proxy', 1)

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://chatly-sandy.vercel.app"],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

// generalLimiter: catch-all safety net (300 req / 15 min per IP).
// Applied AFTER CORS so preflight OPTIONS requests are unaffected,
// and BEFORE route registration so every HTTP endpoint is covered.
// Socket.IO uses a separate HTTP upgrade path and is NOT affected.
app.use(generalLimiter)

app.get('/', (req, res) => {
  res.status(200).json({ status: 'running', message: 'Server is running' })
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)

app.use((err, req, res, next) => {
  if (err?.message === 'format not supported') {
    return res.status(400).json({ message: 'format not supported' });
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large (max 5MB)' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong' });
});

const startServer = async () => {
  try {
    await connectDb();

    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
