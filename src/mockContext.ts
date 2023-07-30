import redisMock from 'ioredis-mock'
import { CouponRepository } from './coupon/infra/orm/repositories/CouponRepository'
import { CouponService } from './coupon/services/CouponService'
import { ORM } from './shared/tests/mocks/orm'
import { Context } from './context'
import { rateLimitedCoupons } from './config'
import { ConcurrentRateLimiter } from './coupon/helpers/ConcurrentRateLimiter'
import { CouponType } from './coupon/entities/ICoupon'
import { CouponQueues } from './coupon/infra/queue/CouponQueue'

export const mockContext = async () => {
  const orm = await ORM.getInstance()
  const redis = new redisMock()
  const em = await orm.em.fork()
  const couponRepository = new CouponRepository(em, redis)

  const concurrentRequestRateLimiters = Object.entries(rateLimitedCoupons).reduce((acc, [key, value]) => {
    return { ...acc, [key]: new ConcurrentRateLimiter(value.concurrentLimit) }
  }, {} as Record<CouponType, ConcurrentRateLimiter>)

  return {
    cache: redis,
    orm,
    couponRepository,
    couponService: new CouponService(couponRepository),
    concurrentRequestRateLimiters
  } as Context
}
