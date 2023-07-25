import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType, ICoupon } from '@/coupon/entities/ICoupon'
import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { Base } from '@/shared/infra/models/Base'
import { Entity, Enum, OneToOne, Property } from '@mikro-orm/core'
import { Coupon } from './Coupon'
import { UserIdType } from '@/types'

@Entity()
export class UserCoupon extends Base implements IUserCoupon {
  @Property()
  userId: string

  @Property()
  usages: number

  @OneToOne({ inversedBy: 'assignedUser' })
  coupon!: Coupon

  @Property({ hidden: true })
  get remainingUsages(): number {
    throw new Error('Method not implemented.')
  }

  @Property({ hidden: true })
  get isValid(): boolean {
    throw new Error('Method not implemented.')
  }

  constructor({ userId }: { userId: UserIdType }) {
    super()
    this.usages = 0
    this.userId = userId
  }
}
