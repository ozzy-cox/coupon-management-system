import { Worker, isMainThread } from 'worker_threads'
import { fileURLToPath } from 'url'
import { CouponRequestHandler } from './CouponRequestHandler'
import { IRateLimitedCouponQueue } from '../interfaces/IRateLimitedCouponQueue'
import { ITokenRateLimiter } from '../interfaces/ITokenRateLimiter'
import { Context } from '@/context'

const createCouponWorker = (
  queue: IRateLimitedCouponQueue,
  limiter: ITokenRateLimiter,
  context: Context
) => {
  const __filename = fileURLToPath(import.meta.url)
  let rateLimitedCouponWorker: Worker
  if (isMainThread) {
    rateLimitedCouponWorker = new Worker(__filename, { workerData: 'hello' })
    rateLimitedCouponWorker.on('online', () => {
      // eslint-disable-next-line no-constant-condition
      const couponRequestHandler = new CouponRequestHandler(queue, limiter, context)
      setInterval(async () => {
        await couponRequestHandler.handle()
      }, 100)
    })
  }
}

export { createCouponWorker }
