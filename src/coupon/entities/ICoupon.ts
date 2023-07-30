import { Base } from '@/shared/infra/models/Base'
import { UserIdType } from '@/types'

export enum CouponType {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  MEGADEAL = 'MEGADEAL',
  NONE = 'NONE'
}

export enum DiscountType {
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE'
}

export interface ICoupon extends Base {
  couponCode: string
  couponType: CouponType
  discountAmount: number
  discountType: DiscountType
  expiryDate: Date
  maxUsages: number // int
  // Below property denotes the time until a rate limited coupon
  // is allocated to a user until retrieval, up to 10 seconds from present
  allocatedUntil?: Date
}
