import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType, ICoupon } from '@/coupon/entities/ICoupon'
import { Base } from '@/shared/infra/models/Base'
import { Entity, Enum, OneToOne, Property, Rel } from '@mikro-orm/core'
import { UserCoupon } from './UserCoupon'

@Entity()
export class Coupon extends Base implements ICoupon {
  @Property()
  couponCode: string

  @Enum(() => CouponType)
  couponType: CouponType

  @Property()
  discountAmount: number

  @Property()
  discountType: DiscountType

  @Property()
  expiryDate: Date

  @Property()
  maxUsages: number

  @OneToOne({ mappedBy: 'coupon', orphanRemoval: true })
  assignedUser!: Rel<UserCoupon>

  @Property()
  allocatedUntil?: Date

  constructor({ couponCode, couponType, discountAmount, discountType, expiryDate, maxUsages }: CouponParams) {
    super()
    this.couponCode = couponCode
    this.couponType = couponType
    this.discountAmount = discountAmount
    this.discountType = discountType
    this.expiryDate = expiryDate
    this.maxUsages = maxUsages
  }
}
