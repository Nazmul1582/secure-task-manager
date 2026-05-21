import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import { sendSuccess } from './utils/apiResponse.js'

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (_req, res) => {
  sendSuccess(res, {
    message: 'API is healthy',
    data: {
      service: 'secure-task-manager-api',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
