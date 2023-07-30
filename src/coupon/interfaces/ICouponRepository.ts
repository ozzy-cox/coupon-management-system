import { CouponAllocationIdType, UserIdType } from '@/types'
import { CouponParams } from '../controllers/CouponController'
import { ICoupon } from '../entities/ICoupon'
import { IUserCoupon } from '../entities/IUserCoupon'

export interface ICouponRepository {
  persistCoupons(coupons: CouponParams[]): Promise<ICoupon[]>
  getCoupons(couponIds: ICoupon['id'][]): Promise<(ICoupon | undefined)[]>
  assignCoupon(userId: UserIdType, couponType: ICoupon['couponType']): Promise<IUserCoupon>
  assignCouponById(userId: UserIdType, couponId: ICoupon['id']): Promise<IUserCoupon>
  getUserCoupons(userId: UserIdType, couponIds: ICoupon['id'][]): Promise<IUserCoupon[]>
  updateCouponUsages(userId: UserIdType, couponId: ICoupon['id']): Promise<IUserCoupon>
  removeExpiredCoupons(): Promise<ICoupon[]> // Return purged coupons
  allocateCoupon(
    userId: UserIdType,
    couponType: ICoupon['couponType'],
    trackingId: string
  ): Promise<CouponAllocationIdType>
  getNextAvailableCouponByType(couponType: ICoupon['couponType']): Promise<ICoupon>
  checkCouponRequestStatus(userId: UserIdType, trackingId: CouponAllocationIdType): Promise<IUserCoupon | undefined>
}
