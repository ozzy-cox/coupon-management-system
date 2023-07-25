import { Base } from '@/shared/infra/models/Base'

export enum CouponType {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  MEGADEAL = 'MEGADEAL'
}

export enum DiscountType {
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE'
}

export interface ICoupon extends Base {
  couponCode: string
  couponType?: CouponType
  discountAmount: number
  discountType: DiscountType
  expiryDate: Date
  maxUsages: number // int
}
