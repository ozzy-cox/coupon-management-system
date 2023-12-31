import redisMock from 'ioredis-mock'
import { CouponRepository } from './coupon/infra/orm/repositories/CouponRepository'
import { CouponService } from './coupon/services/CouponService'
import { ORM } from './shared/tests/mocks/orm'
import { Context } from './context'
import { RateLimiters } from './coupon/helpers/ConcurrentRateLimiter'

export const mockContext = async () => {
  const orm = await ORM.getInstance()
  const redis = new redisMock()
  const em = await orm.em.fork()
  const couponRepository = new CouponRepository(em, redis)

  const concurrentRequestRateLimiters = RateLimiters.getInstance()
  return {
    cache: redis,
    orm,
    couponRepository,
    couponService: new CouponService(couponRepository),
    concurrentRequestRateLimiters
  } as Context
}
