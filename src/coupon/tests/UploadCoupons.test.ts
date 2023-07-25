import { ORM, wipeDb } from '@/shared/tests/mocks/orm'
import { CouponRepository } from '../infra/orm/repositories/CouponRepository'
import { CouponParams } from '../controllers/CouponController'
import { DiscountType } from '../entities/ICoupon'
import { every, isEqual } from 'lodash-es'

describe('uploading coupons', () => {
  beforeAll(async () => {
    wipeDb()
  })

  test('should upload coupons and validate', async () => {
    const orm = await ORM.getInstance()
    const em = await orm.em.fork()
    const couponRepo = new CouponRepository(em)

    const now = new Date()

    const coupons: CouponParams[] = [
      {
        couponCode: '01A',
        discountAmount: 20,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 1),
        maxUsages: 5
      },

      {
        couponCode: '01B',
        discountAmount: 30,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 5),
        maxUsages: 1
      },

      {
        couponCode: '01C',
        discountAmount: 15,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 3),
        maxUsages: 2
      }
    ]

    const couponResponse = await couponRepo.persistCoupons(coupons)

    const fetchedCoupons = await couponRepo.getCoupons(couponResponse.map((coupon) => coupon.id))

    expect(every(couponResponse, (coupon, idx) => isEqual(coupon, fetchedCoupons[idx]))).toBeTruthy()
  })
})
