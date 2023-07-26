import { UserIdType } from '@/types'
import { CouponParams } from '../controllers/CouponController'
import { CouponType, ICoupon } from '../entities/ICoupon'
import { ICouponRepository } from '../repositories/ICouponRepository'
import { IUserCoupon } from '../entities/IUserCoupon'

export enum CouponStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED'
}

export class CouponService {
  constructor(private repository: ICouponRepository) {}

  async saveCoupons(coupons: CouponParams[]) {
    // TODO filter out expired coupons
    this.repository.persistCoupons(coupons)
  }

  async requestCoupon(userId: UserIdType, couponType: ICoupon['couponType']) {
    if (couponType && couponType === CouponType.MEGADEAL) {
      // TODO Check rate limiting, queue the task if necessary
    } else {
      return this.repository.assignCoupon(userId, couponType)
    }
  }

  async validateCoupon(userId: UserIdType, couponId: ICoupon['id']): Promise<CouponStatus> {
    const userCouponResponse = await this.repository.getUserCoupons(userId, [couponId])
    if (userCouponResponse.length > 0) {
      const userCoupon = userCouponResponse[0]
      if (userCoupon.remainingUsages === 0) {
        return CouponStatus.EXHAUSTED
      }
      if (userCoupon.coupon.expiryDate < new Date()) {
        return CouponStatus.EXPIRED
      }
      return CouponStatus.VALID
    }
    return CouponStatus.INVALID
  }

  async redeemCoupon(userId: UserIdType, couponId: ICoupon['id']): Promise<IUserCoupon> {
    // TODO validation should be moved to controller level
    const isValid = await this.validateCoupon(userId, couponId)
    if (isValid === CouponStatus.VALID) {
      return await this.repository.updateCouponUsages(userId, couponId)
    } else {
      throw new Error('Not a valid coupon')
    }
  }
}
