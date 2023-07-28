import { Context } from '@/context'
import { mockContext } from '@/mockContext'
import { CouponType, DiscountType } from '../entities/ICoupon'
import { CouponParams } from '../controllers/CouponController'
import { wipeDb } from '@/shared/tests/mocks/orm'
import assert from 'assert'
import { createdCouponCacheKey, usedCouponCacheKey } from '@/config'

describe('Counting created and used coupons', () => {
  let context: Context
  let coupons: CouponParams[]
  const now = new Date()
  const userId = 'userA-1'

  beforeAll(async () => {
    context = await mockContext()
  })

  beforeEach(async () => {
    await wipeDb()
    coupons = [
      {
        couponCode: '01A',
        discountAmount: 20,
        couponType: CouponType.STANDARD,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 10000),
        maxUsages: 5
      },

      {
        couponCode: '01B',
        discountAmount: 30,
        couponType: CouponType.STANDARD,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 50000),
        maxUsages: 1
      },
      {
        couponCode: '01C',
        discountAmount: 15,
        couponType: CouponType.STANDARD,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 30000),
        maxUsages: 2
      }
    ]

    await context.couponService.saveCoupons(coupons)
  })

  test('should update created coupon counts', async () => {
    const countsBeforeUploadingCoupons = await context.cache.get(`${createdCouponCacheKey}-${CouponType.STANDARD}`)

    expect(countsBeforeUploadingCoupons).toBe(String(coupons.length))

    await context.couponService.saveCoupons([
      {
        couponCode: '01C',
        discountAmount: 15,
        couponType: CouponType.STANDARD,
        discountType: DiscountType.PERCENTAGE,
        expiryDate: new Date(now.getTime() + 3),
        maxUsages: 2
      }
    ])

    const countsAfterUploadingCoupons = await context.cache.get(`${createdCouponCacheKey}-${CouponType.STANDARD}`)
    expect(countsAfterUploadingCoupons).toBe(String(coupons.length + 1))
  })

  test('should update used coupon counts', async () => {
    const assignedCoupon = await context.couponService.requestCoupon(userId, CouponType.STANDARD)
    assert(assignedCoupon)

    const countsBeforeUsingCoupons = await context.cache.get(`${usedCouponCacheKey}-${CouponType.STANDARD}`)
    expect(countsBeforeUsingCoupons).toBe(null)

    await context.couponService.redeemCoupon(userId, assignedCoupon.coupon.id)

    const countsAfterUsingCoupons = await context.cache.get(`${usedCouponCacheKey}-${CouponType.STANDARD}`)
    expect(countsAfterUsingCoupons).toBe(String(1))
  })

  afterAll(async () => {
    await context.orm.close()
  })
})
