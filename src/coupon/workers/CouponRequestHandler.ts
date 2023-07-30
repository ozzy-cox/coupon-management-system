import { Context } from '@/context'
import { IRateLimitedCouponQueue } from '../interfaces/IRateLimitedCouponQueue'
import { ITokenRateLimiter } from '../interfaces/ITokenRateLimiter'

export class CouponRequestHandler {
  constructor(private queue: IRateLimitedCouponQueue, private limiter: ITokenRateLimiter, private context: Context) {}

  async handle() {
    if (this.limiter.tokens > 1 && (await this.queue.len()) > 0) {
      const couponAmount = Math.min(this.limiter.tokens, await this.queue.len())
      for (let i = 0; i < couponAmount; i++) {
        const couponRequest = await this.queue.pop()
        try {
          await this.context.couponRepository.allocateCoupon(
            couponRequest.userId,
            couponRequest.couponType,
            couponRequest.trackingId
          )
        } catch (error) {
          this.onError(error, couponRequest.trackingId)
        }
        this.limiter.removeTokens(1)
      }
    }
  }

  async onError(error: unknown, trackingId: string) {
    // TODO write the results of the request error to redis.
    console.log(error, trackingId)
  }
}
