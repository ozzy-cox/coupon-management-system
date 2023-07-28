import { UserIdType } from '@/types'
import { CouponParams } from '../controllers/CouponController'
import { ICoupon } from '../entities/ICoupon'
import { IUserCoupon } from '../entities/IUserCoupon'
import { UserCoupon } from '../infra/orm/models/UserCoupon'

export interface ICouponRepository {
  persistCoupons(coupons: CouponParams[]): Promise<ICoupon[]>
  getCoupons(couponIds: ICoupon['id'][]): Promise<(ICoupon | undefined)[]>
  assignCoupon(userId: UserIdType, couponType: ICoupon['couponType']): Promise<IUserCoupon>
  getUserCoupons(userId: UserIdType, couponIds: ICoupon['id'][]): Promise<IUserCoupon[]>
  updateCouponUsages(userId: UserIdType, couponId: ICoupon['id']): Promise<IUserCoupon>
  removeExpiredCoupons(): Promise<ICoupon[]> // Return purged coupons
}
