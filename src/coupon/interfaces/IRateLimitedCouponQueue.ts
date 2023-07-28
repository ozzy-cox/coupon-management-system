import { UserIdType } from '@/types'
import { CouponType, ICoupon } from '../entities/ICoupon'

export type CouponRequest = {
  userId: UserIdType
  couponType: CouponType
}

export interface IRateLimitedCouponQueue {
  push(request: CouponRequest): void
  pop(): Promise<CouponRequest>
  len(): Promise<number>
  quit(): Promise<void>
  clear(): Promise<void>
}
