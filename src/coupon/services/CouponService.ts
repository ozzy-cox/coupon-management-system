import { CouponParams } from '../controllers/CouponController'
import { CouponType, ICoupon } from '../entities/ICoupon'
import { ICouponRepository } from '../repositories/ICouponRepository'

export class CouponService {
  constructor(private repository: ICouponRepository) {}

  async saveCoupons(coupons: CouponParams[]) {
    // TODO filter out expired coupons
    this.repository.persistCoupons(coupons)
  }

  async requestCoupon(userId: string, couponType: ICoupon['couponType']) {
    if (couponType && couponType === CouponType.MEGADEAL) {
      // TODO Check rate limiting, queue the task if necessary
    } else {
      try {
        return this.repository.assignCoupon(userId, couponType)
      } catch (error) {
        return error
      }
    }
  }
}
