import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { schedule } from 'node-cron'
import { Context } from './context'
import {
  queryCouponRequestStatus,
  redeemCoupon,
  requestNewCoupon,
  uploadCoupons,
  validateCoupon
} from './coupon/controllers/CouponController'
import { mockContext } from './mockContext'
import { purgeExpiredCoupons } from './coupon/tasks/PurgeExpiredCoupons'
import pinoHTTP from 'pino-http'
import { logger } from './shared/infra/logging/pinoTransports'
import { errorHandler } from './coupon/middlewares/ErrorHandler'
import {
  redeemValidationRules,
  requestNewValidationRules,
  requestStatusValidationRules,
  uploadValidationRules,
  validateValidationRules
} from './coupon/controllers/validation/CouponControllerRules'
import { CouponQueues } from './coupon/infra/queue/CouponQueue'
import { rateLimitedCoupons } from './config'
import { createCouponWorker } from './coupon/workers/RateLimitedCouponWorker'
import { TokenRateLimiter } from './coupon/infra/rate-limiter/RateLimiter'

export const app: Express = express()

const context = await mockContext()
const contextMiddleware =
  (context: Context) => (req: Request, res: Response, next: NextFunction) => {
    req.context = context
    next()
  }

const couponQueues = CouponQueues.getInstance()
// Spawn worker threads
Object.entries(couponQueues).forEach(([key, queue]) => {
  const rateLimitOptions = rateLimitedCoupons[key]
  queue.clear()
  createCouponWorker(
    queue,
    new TokenRateLimiter({
      tokensPerInterval: rateLimitOptions.perSecondLimit,
      interval: rateLimitOptions.interval
    }),
    context
  )
})

// Run cron task for purging expired coupons, every week
schedule('0 0 * * 0', () => {
  purgeExpiredCoupons(context.couponRepository)
})

app.use(cors())
app.use(
  pinoHTTP({
    logger,
    quietReqLogger: true
  })
)
app.use(contextMiddleware(context))
app.use(express.urlencoded({ extended: false }))

app.use(express.json())

app.post('/upload', uploadValidationRules(), uploadCoupons)
app.get('/request-new', requestNewValidationRules(), requestNewCoupon)
app.post('/redeem', redeemValidationRules(), redeemCoupon)
app.get('/validate', validateValidationRules(), validateCoupon)
app.get('/request-status', requestStatusValidationRules(), queryCouponRequestStatus)

app.use(errorHandler)
