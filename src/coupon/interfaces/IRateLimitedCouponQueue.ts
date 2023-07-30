import { UserIdType } from '@/types'
import { CouponType } from '../entities/ICoupon'

export type CouponRequest = {
  trackingId: string
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
