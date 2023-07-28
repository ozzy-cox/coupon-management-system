import { ORM, wipeDb } from '@/shared/tests/mocks/orm'
import { CouponRepository } from '../infra/orm/repositories/CouponRepository'
import { CouponParams } from '../controllers/CouponController'
import { DiscountType } from '../entities/ICoupon'
import { Context } from '@/context'
import { mockContext } from '@/mockContext'

describe('uploading coupons', () => {
  let context: Context
  beforeAll(async () => {
    context = await mockContext()
    await wipeDb()
  })

  test('should upload coupons and validate', async () => {
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

    const couponResponse = await context.couponRepository.persistCoupons(coupons)

    const fetchedCoupons = await context.couponRepository.getCoupons(couponResponse.map((coupon) => coupon.id))

    const hasAllCreatedCoupons = couponResponse.reduce((acc, curr) => {
      return acc && !!fetchedCoupons.find((coupon) => coupon && coupon.id === curr.id)
    }, true)

    expect(hasAllCreatedCoupons).toBeTruthy()
  })

  afterAll(async () => {
    await (await ORM.getInstance()).close()
  })
})
