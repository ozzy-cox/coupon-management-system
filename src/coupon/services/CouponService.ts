import { UserIdType } from '@/types'
import { CouponParams } from '../controllers/CouponController'
import { ICoupon } from '../entities/ICoupon'
import { ICouponRepository } from '../interfaces/ICouponRepository'
import { IUserCoupon } from '../entities/IUserCoupon'
import { UpdateCreatedCouponCounts, UpdateUsedCouponCounts } from '../helpers/UpdateCouponCounts'
import { rateLimitedCoupons } from '@/config'
import { LogUsedCoupon } from '@/shared/infra/logging/LogDecorators'
import { v4 } from 'uuid'
import { CouponQueues } from '../infra/queue/CouponQueue'
import { HTTPError } from '../helpers/HTTPError'

export enum CouponStatus {
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

  async requestRateLimitedCoupon(userId: UserIdType, couponType: ICoupon['couponType']) {
    const couponQueues = await CouponQueues.getInstance()
    const couponOptions = rateLimitedCoupons[couponType]
    const queue = couponQueues[couponType]
    const length = await queue.len()
    if (length >= couponOptions.canWait * couponOptions.perSecondLimit) {
      throw new HTTPError('Too many users in the queue, try again later', 429)
    }

    const countOfRequestedCoupons = await this.repository.getCouponCounts(couponType)
    if (length >= countOfRequestedCoupons) {
      throw new HTTPError('Not enough coupons remaining, try again later', 429)
    }

    const trackingId = v4()
    await queue.push({
      userId,
      couponType,
      trackingId
    })
    return trackingId
  }

  async requestCoupon(userId: UserIdType, couponType: ICoupon['couponType']) {
    return this.repository.assignCoupon(userId, couponType)
  }

  async validateCoupon(
    userId: UserIdType,
    couponCode: ICoupon['couponCode']
  ): Promise<CouponStatus | IUserCoupon> {
    const userCouponResponse = await this.repository.getUserCoupons(userId, [couponCode])
    if (userCouponResponse.length > 0) {
      const userCoupon = userCouponResponse[0]
      if (userCoupon.remainingUsages === 0) {
        return CouponStatus.EXHAUSTED
      }
      if (userCoupon.coupon.expiryDate < new Date()) {
        return CouponStatus.EXPIRED
      }
      return userCoupon
    }
    return CouponStatus.INVALID
  }

  @LogUsedCoupon()
  @UpdateUsedCouponCounts()
  async redeemCoupon(userId: UserIdType, couponId: ICoupon['id']): Promise<IUserCoupon> {
    const couponValidity = await this.validateCoupon(userId, couponId)
    if (typeof couponValidity === 'object') {
      return await this.repository.updateCouponUsages(userId, couponId)
    } else {
      switch (couponValidity) {
        case CouponStatus.EXPIRED:
          throw new HTTPError('Coupon expired', 410)
        case CouponStatus.EXHAUSTED:
          throw new HTTPError('Coupon exhausted', 429)
        default:
          throw new HTTPError('Coupon invalid', 400)
      }
    }
  }

  async checkCouponRequestStatus(
    userId: UserIdType,
    trackingId: string
  ): Promise<IUserCoupon | undefined> {
    const result = this.repository.checkCouponRequestStatus(userId, trackingId)
    return result
  }
}
