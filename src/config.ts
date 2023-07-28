import { CouponType } from './coupon/entities/ICoupon'

export type RateLimitedQueueOptions = {
  simultaneous: number
  perSecond: number
  canWait: number
  interval: number
}

const createdCouponCacheKey = 'createdCouponType'
const usedCouponCacheKey = 'usedCouponType'
const rateLimitedCoupons: Record<string, RateLimitedQueueOptions> = {
  [CouponType.MEGADEAL]: {
    simultaneous: 5, // There can be 5 simultaneous requests for this coupon ???
    perSecond: 10, // 10 coupons will be given each second
    canWait: 10, //seconds
    interval: 1000
  }
}

export { createdCouponCacheKey, usedCouponCacheKey, rateLimitedCoupons }
