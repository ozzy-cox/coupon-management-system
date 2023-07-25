import redisMock from 'ioredis-mock'
import { CouponRepository } from './coupon/infra/orm/repositories/CouponRepository'
import { CouponService } from './coupon/services/CouponService'
import { ORM } from './shared/tests/mocks/orm'

export const mockContext = async () => {
  const orm = await ORM.getInstance()
  const redis = new redisMock()
  const em = await orm.em.fork()
  return {
    couponService: new CouponService(new CouponRepository(em))
  }
}
