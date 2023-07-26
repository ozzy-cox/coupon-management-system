import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType, ICoupon } from '@/coupon/entities/ICoupon'
import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { Base } from '@/shared/infra/models/Base'
import { Entity, Enum, OneToOne, Property, Rel } from '@mikro-orm/core'
import { Coupon } from './Coupon'
import { UserIdType } from '@/types'

@Entity()
export class UserCoupon extends Base implements IUserCoupon {
  @Property()
  userId: string

  @Property()
  usages: number

  @OneToOne()
  coupon!: Rel<Coupon>

  @Property({ hidden: true })
  get remainingUsages(): number {
    return this.coupon.maxUsages - this.usages
  }

  @Property({ hidden: true })
  get isValid(): boolean {
    return this.remainingUsages > 0
  }

  constructor({ userId }: { userId: UserIdType }) {
    super()
    this.usages = 0
    this.userId = userId
  }
}
