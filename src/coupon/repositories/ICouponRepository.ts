import { UserIdType } from '@/types'
import { CouponParams } from '../controllers/CouponController'
import { CouponType, ICoupon } from '../entities/ICoupon'
import { IUserCoupon } from '../entities/IUserCoupon'

export interface ICouponRepository {
  persistCoupons(coupons: CouponParams[]): Promise<ICoupon[]>
  getCoupons(couponIds: ICoupon['id'][]): Promise<(ICoupon | undefined)[]>
  assignCoupon(userId: UserIdType, couponType: ICoupon['couponType']): Promise<IUserCoupon>
}
