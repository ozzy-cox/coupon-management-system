import { CouponParams } from '@/coupon/controllers/CouponController'
import { ICoupon } from '@/coupon/entities/ICoupon'
import { ICouponRepository } from '@/coupon/interfaces/ICouponRepository'
import { EntityManager, SqlEntityRepository } from '@mikro-orm/sqlite'
import { Coupon } from '../models/Coupon'
import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { UserCoupon } from '../models/UserCoupon'
import { UserIdType } from '@/types'

export class CouponRepository implements ICouponRepository {
  private couponRepository: SqlEntityRepository<Coupon>
  private userCouponRepository: SqlEntityRepository<UserCoupon>
  private em: EntityManager

  constructor(em: EntityManager) {
    this.couponRepository = em.getRepository(Coupon)
    this.userCouponRepository = em.getRepository(UserCoupon)
    this.em = em
  }

  async removeExpiredCoupons(): Promise<ICoupon[]> {
    const expiredCoupons = await this.couponRepository.find({ expiryDate: { $lt: new Date() } })
    await this.em.remove(expiredCoupons)
    await this.em.flush()
    return expiredCoupons
  }

  async getCoupons(couponIds: string[]): Promise<ICoupon[]> {
    return await this.couponRepository.find({ id: { $in: couponIds } }, { cache: true })
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

  async assignCoupon(userId: string, couponType: ICoupon['couponType']): Promise<IUserCoupon> {
    const nextAvailableCoupon = await this.couponRepository.findOne({ couponType: couponType, assignedUser: null })
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

  async getUserCoupons(userId: string, couponIds: string[]): Promise<IUserCoupon[]> {
    return await this.userCouponRepository.find({ coupon: { id: { $in: couponIds } }, userId })
  }

  async updateCouponUsages(userId: UserIdType, couponId: string): Promise<IUserCoupon> {
    const userCouponResponse = await this.getUserCoupons(userId, [couponId])
    if (userCouponResponse.length) {
      const userCoupon = userCouponResponse[0]
      userCoupon.usages++
      this.em.persist(userCoupon)
      await this.em.flush()
      return userCoupon
    } else {
      throw new Error('Coupon not found')
    }
  }
}
