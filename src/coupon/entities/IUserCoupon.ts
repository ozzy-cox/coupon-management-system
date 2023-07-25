import { IBase } from '@/shared/entities/IBase'
import { ICoupon } from './ICoupon'

export interface IUserCoupon extends IBase {
  userId: string
  usages: number // int
  coupon: ICoupon

  get remainingUsages(): number
  get isValid(): boolean
}
