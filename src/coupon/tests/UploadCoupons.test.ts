import { CouponParams } from '../controllers/CouponController'
import { CouponType, DiscountType } from '../entities/ICoupon'
import { Context } from '@/context'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'

describe('uploading coupons', () => {
  const getContext = useTestContext()
  let context: Context

  beforeAll(() => {
    context = getContext()
  })

  test('should upload coupons and validate', async () => {
    const now = new Date()

    const coupons: CouponParams[] = [
      {
        couponCode: '01A',
        discountAmount: 20,
        couponType: CouponType.NONE,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 1),
        maxUsages: 5
      },

      {
        couponCode: '01B',
        discountAmount: 30,
        couponType: CouponType.NONE,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 5),
        maxUsages: 1
      },
      {
        couponCode: '01C',
        discountAmount: 15,
        couponType: CouponType.NONE,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 3),
        maxUsages: 2
      }
    ]

    const couponResponse = await context.couponRepository.persistCoupons(coupons)

    const fetchedCoupons = await context.couponRepository.getCoupons(
      couponResponse.map((coupon) => coupon.id)
    )

    const hasAllCreatedCoupons = couponResponse.reduce((acc, curr) => {
      return acc && !!fetchedCoupons.find((coupon) => coupon && coupon.id === curr.id)
    }, true)

    expect(hasAllCreatedCoupons).toBeTruthy()
  })
})
