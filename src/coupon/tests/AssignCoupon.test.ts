import { ORM, wipeDb } from '@/shared/tests/mocks/orm'
import { CouponType, DiscountType, ICoupon } from '../entities/ICoupon'
import { CouponParams } from '../controllers/CouponController'
import { CouponStatus } from '../services/CouponService'
import { mockContext } from '@/mockContext'
import { Context } from '@/context'

describe('Assigning a coupon to a user', () => {
  let couponResponse: ICoupon[]
  let context: Context
  const userId = 'userA-1'

  beforeAll(async () => {
    context = await mockContext()
  })

  beforeEach(async () => {
    await wipeDb()
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
        couponType: CouponType.STANDARD,
        discountAmount: 20,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() - 1000), // Expired coupon
        maxUsages: 5
      },
      {
        couponCode: '01C',
        discountAmount: 20,
        couponType: CouponType.FREE,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime()), // Already exhausted coupon
        maxUsages: 0
      }
    ]

    couponResponse = await context.couponRepository.persistCoupons(coupons)
  })

  test('should create and assign a coupon to a user', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, null)

    expect(assignedCoupon.coupon).toEqual(couponResponse[0])
  })

  test('should attempt to assign a coupon to a user when type of coupon is not available', async () => {
    const assignCoupon = async () => {
      await context.couponRepository.assignCoupon(userId, CouponType.MEGADEAL)
    }
    await expect(assignCoupon).rejects.toThrow()
  })

  test('should validate an assigned coupon', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, null)

    const isValid = await context.couponService.validateCoupon(userId, assignedCoupon.coupon.id)

    expect(isValid).toBeTruthy()
  })

  test('should attempt to validate an expired coupon', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, CouponType.STANDARD) // Only standard type coupon is expired

    const isValid = await context.couponService.validateCoupon(userId, assignedCoupon.coupon.id)

    expect(isValid).toEqual(CouponStatus.EXPIRED)
  })

  test('should attempt to validate an exhausted coupon', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, CouponType.FREE) // Free coupon is already exhausted

    const isValid = await context.couponService.validateCoupon(userId, assignedCoupon.coupon.id)

    expect(isValid).toEqual(CouponStatus.EXHAUSTED)
  })

  afterAll(async () => {
    await (await ORM.getInstance()).close()
  })
})
