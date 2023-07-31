import { CouponStatus } from '../services/CouponService'
import { CouponType, DiscountType } from '../entities/ICoupon'
import { CouponParams } from '../controllers/CouponController'
import { purgeExpiredCoupons } from '../tasks/PurgeExpiredCoupons'
import { Context } from '@/context'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'

describe('Purging expired coupons', () => {
  const getContext = useTestContext()
  let context: Context
  const userId = 'userA-1'

  beforeAll(() => {
    context = getContext()
  })

  beforeEach(async () => {
    const now = new Date()
    const coupons: CouponParams[] = [
      {
        couponCode: '01A',
        discountAmount: 20,
        couponType: CouponType.NONE,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() - 100000),
        maxUsages: 5
      }
    ]

    await context.couponRepository.persistCoupons(coupons)
  })

  test('should remove expired coupons', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, CouponType.NONE)
    expect(
      await context.couponService.validateCoupon(userId, assignedCoupon.coupon.couponCode)
    ).toBe(CouponStatus.EXPIRED)

    // context = await mockContext()
    await purgeExpiredCoupons(context.couponRepository)
    expect(await context.couponService.validateCoupon(userId, assignedCoupon.coupon.id)).toBe(
      CouponStatus.INVALID
    )
  })
})
