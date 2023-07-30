import { SqliteMikroORM } from '@mikro-orm/sqlite/SqliteMikroORM'
import { CouponService } from './coupon/services/CouponService'
import { Redis } from 'ioredis'
import { ICouponRepository } from './coupon/interfaces/ICouponRepository'
import { CouponType } from './coupon/entities/ICoupon'
import { ConcurrentRateLimiter } from './coupon/helpers/ConcurrentRateLimiter'

export interface Context {
  couponService: CouponService
  couponRepository: ICouponRepository
  orm: SqliteMikroORM
  cache: Redis
  concurrentRequestRateLimiters: Record<CouponType, ConcurrentRateLimiter>
}
