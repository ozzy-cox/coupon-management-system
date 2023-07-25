import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, ICoupon } from '@/coupon/entities/ICoupon'
import { ICouponRepository } from '@/coupon/repositories/ICouponRepository'
import { EntityManager, SqlEntityRepository } from '@mikro-orm/sqlite'
import { Coupon } from '../models/Coupon'
import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { UserCoupon } from '../models/UserCoupon'

export class CouponRepository implements ICouponRepository {
  private repository: SqlEntityRepository<Coupon>
  private em: EntityManager

  constructor(em: EntityManager) {
    this.repository = em.getRepository(Coupon)
    this.em = em
  }

  async getCoupons(couponIds: string[]): Promise<ICoupon[]> {
    return await this.repository.find({ id: { $in: couponIds } }, { cache: true })
  }

  async persistCoupons(couponParams: CouponParams[]): Promise<ICoupon[]> {
    const coupons: ICoupon[] = []
    for (let i = 0; i < couponParams.length; i++) {
      const coupon = new Coupon(couponParams[i])
      this.em.persist(coupon)
      coupons.push(coupon)
    }
    await this.em.flush()

    return coupons
  }

  async assignCoupon(userId: string, couponType: CouponType | undefined): Promise<IUserCoupon> {
    const nextAvailableCoupon = await this.repository.findOne({ couponType: couponType })
    if (nextAvailableCoupon) {
      const userCoupon = new UserCoupon({ userId })
      userCoupon.coupon = nextAvailableCoupon
      this.em.persist(userCoupon)
      await this.em.flush()
      return userCoupon
    } else {
      throw new Error('No available coupons')
    }
  }
}
