import { Context } from '@/context'
import { IRateLimitedCouponQueue } from '../interfaces/IRateLimitedCouponQueue'
import { IUserCoupon } from '../entities/IUserCoupon'
import { ITokenRateLimiter } from '../interfaces/ITokenRateLimiter'

export class CouponRequestHandler {
  constructor(private queue: IRateLimitedCouponQueue, private limiter: ITokenRateLimiter, private context: Context) {}

  async handle() {
    try {
      if (this.limiter.tokens > 1 && (await this.queue.len()) > 0) {
        const couponAmount = Math.min(this.limiter.tokens, await this.queue.len())
        for (let i = 0; i < couponAmount; i++) {
          const couponParams = await this.queue.pop()
          const coupon = await this.context.couponRepository.assignCoupon(couponParams.userId, couponParams.couponType)
          this.limiter.removeTokens(1)
          this.onSuccess(coupon)
        }
      }
    } catch (error) {
      this.onError(error)
    }
  }

  async onError(error: unknown) {
    // TODO write the results of the request error to redis.
  }

  async onSuccess(coupon: IUserCoupon) {
    // TODO write the results of the request success to redis.
  }
}
