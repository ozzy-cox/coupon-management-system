import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { Context } from './context'
import { uploadCoupons } from './coupon/controllers/CouponController'
import { rateLimitedCoupons } from './config'
import { createCouponWorker } from './coupon/workers/RateLimitedCouponWorker'
import { TokenRateLimiter } from './coupon/infra/rate-limiter/RateLimiter'
import { couponQueues } from './coupon/infra/queue/CouponQueue'
import { mockContext } from './mockContext'

export const app: Express = express()

const contextMiddleware = (context: Context) => (req: Request, res: Response, next: NextFunction) => {
  req.context = context
  next()
}

const context = await mockContext()

// Spawn worker threads
Object.entries(couponQueues).forEach(([key, queue]) => {
  const rateLimitOptions = rateLimitedCoupons[key]
  queue.clear()
  createCouponWorker(
    queue,
    new TokenRateLimiter({
      tokensPerInterval: rateLimitOptions.perSecond,
      interval: rateLimitOptions.interval
    }),
    context
  )
})

app.use(cors())
app.use(contextMiddleware(context))
app.use(express.urlencoded({ extended: false }))

app.use(express.json())

app.use('/upload', uploadCoupons)
