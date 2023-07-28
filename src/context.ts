import { SqliteMikroORM } from '@mikro-orm/sqlite/SqliteMikroORM'
import { CouponService } from './coupon/services/CouponService'
import { Redis } from 'ioredis'
import { ICouponRepository } from './coupon/interfaces/ICouponRepository'

export interface Context {
  couponService: CouponService
  couponRepository: ICouponRepository
  orm: SqliteMikroORM
  cache: Redis
}
