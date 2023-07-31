import { CouponType, DiscountType } from '../entities/ICoupon'
import { CouponParams } from '../controllers/CouponController'
import { Context } from '@/context'
import { HTTPError } from '../helpers/HTTPError'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'

describe('Redeeming coupons', () => {
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
        couponType: CouponType.STANDARD,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 100000),
        maxUsages: 3
      },
      {
        couponCode: '01B',
        discountAmount: 100,
        couponType: CouponType.FREE,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() - 1000),
        maxUsages: 1
      }
    ]

    await context.couponRepository.persistCoupons(coupons)
  })
  test('should redeem a coupon succesfully', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, CouponType.STANDARD)
    const assignedCouponUsages = assignedCoupon.usages

    const redeemedCoupon = await context.couponService.redeemCoupon(
      userId,
      assignedCoupon.coupon.couponCode
    )

    const redeemedCouponUsages = redeemedCoupon.usages

    expect(assignedCouponUsages).toEqual(redeemedCouponUsages - 1)
  })

  test('should attempt to redeem a coupon that is expired', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, CouponType.FREE)

    const attemptToRedeemExpiredCoupon = async () => {
      await context.couponService.redeemCoupon(userId, assignedCoupon.coupon.couponCode)
    }

    await expect(attemptToRedeemExpiredCoupon).rejects.toThrow(new HTTPError('Coupon expired', 410))
  })

  test('should attempt to redeem a coupon that exceeded max usages', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, CouponType.STANDARD)
    for (let i = 0; i < assignedCoupon.coupon.maxUsages; i++) {
      await context.couponService.redeemCoupon(userId, assignedCoupon.coupon.couponCode)
    }

    const attemptToRedeemExhaustedCoupon = async () => {
      await context.couponService.redeemCoupon(userId, assignedCoupon.coupon.couponCode)
    }

    await expect(attemptToRedeemExhaustedCoupon).rejects.toThrow(
      new HTTPError('Coupon exhausted', 429)
    )
  })

  test('should attempt to redeem a coupon that is not assigned to this user', async () => {
    const someOtherUsersId = 'userB-1'
    const assignedCoupon = await context.couponRepository.assignCoupon(
      someOtherUsersId,
      CouponType.FREE
    )

    const attemptToRedeemUnauthorizedCoupon = async () => {
      await context.couponService.redeemCoupon(userId, assignedCoupon.coupon.couponCode)
    }

    await expect(attemptToRedeemUnauthorizedCoupon).rejects.toThrow(
      new HTTPError('Coupon invalid', 400)
    )
  })
})
