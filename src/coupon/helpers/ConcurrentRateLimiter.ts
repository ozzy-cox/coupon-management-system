import { rateLimitedCoupons } from '@/config'
import { CouponType } from '../entities/ICoupon'

// TODO This is another mock, should use redis with atomic operations to support concurrent nodes.
export class ConcurrentRateLimiter {
  count: number
  constructor(private limit: number) {
    this.count = 0
  }
  tryIncrement(): boolean {
    if (this.count < this.limit) {
      this.count++
      return true
    } else {
      return false
    }
  }

  decrement(): void {
    this.count--
  }

  clear(): void {
    this.count = 0
  }
}

let concurrentRateLimiters: Record<CouponType, ConcurrentRateLimiter>

export class RateLimiters {
  public static getInstance() {
    if (!concurrentRateLimiters) {
      concurrentRateLimiters = Object.entries(rateLimitedCoupons).reduce((acc, [key, value]) => {
        return { ...acc, [key]: new ConcurrentRateLimiter(value.concurrentLimit) }
      }, {} as Record<CouponType, ConcurrentRateLimiter>)
    }
    return concurrentRateLimiters
  }
}
