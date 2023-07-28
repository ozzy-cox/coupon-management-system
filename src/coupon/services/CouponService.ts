import { UserIdType } from '@/types'
import { CouponParams } from '../controllers/CouponController'
import { CouponType, ICoupon } from '../entities/ICoupon'
import { ICouponRepository } from '../interfaces/ICouponRepository'
import { IUserCoupon } from '../entities/IUserCoupon'
import { LogUsedCoupon } from '@/shared/infra/logging/Loggers'
import { UpdateCreatedCouponCounts, UpdateUsedCouponCounts } from '../helpers/UpdateCouponCounts'
import { rateLimitedCoupons } from '@/config'

export enum CouponStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED'
}

export class CouponService {
  constructor(private repository: ICouponRepository) {}

  @UpdateCreatedCouponCounts()
  async saveCoupons(coupons: CouponParams[]) {
    return await this.repository.persistCoupons(coupons)
  }

  async requestCoupon(userId: UserIdType, couponType: ICoupon['couponType']) {
    if (couponType && Object.keys(rateLimitedCoupons).includes(couponType)) {
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

  @LogUsedCoupon()
  @UpdateUsedCouponCounts()
  async redeemCoupon(userId: UserIdType, couponId: ICoupon['id']): Promise<IUserCoupon> {
    const couponValidity = await this.validateCoupon(userId, couponId)
    if (couponValidity === CouponStatus.VALID) {
      return await this.repository.updateCouponUsages(userId, couponId)
    } else {
      switch (couponValidity) {
        case CouponStatus.EXPIRED:
          throw new Error('Coupon expired')
        case CouponStatus.EXHAUSTED:
          throw new Error('Coupon exhausted')
        default:
          throw new Error('Coupon invalid')
      }
    }
  }
}
