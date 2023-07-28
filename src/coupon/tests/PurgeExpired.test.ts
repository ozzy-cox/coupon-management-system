import { ORM, wipeDb } from '@/shared/tests/mocks/orm'
import { CouponRepository } from '../infra/orm/repositories/CouponRepository'
import { CouponService, CouponStatus } from '../services/CouponService'
import { DiscountType, ICoupon } from '../entities/ICoupon'
import { CouponParams } from '../controllers/CouponController'
import { purgeExpiredCoupons } from '../tasks/PurgeExpiredCoupons'
import { mockContext } from '@/mockContext'
import { Context } from '@/context'

describe('Purging expired coupons', () => {
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
        expiryDate: new Date(now.getTime() - 100000),
        maxUsages: 5
      }
    ]

    await context.couponRepository.persistCoupons(coupons)
  })

  test('should remove expired coupons', async () => {
    const assignedCoupon = await context.couponRepository.assignCoupon(userId, null)
    expect(await context.couponService.validateCoupon(userId, assignedCoupon.coupon.id)).toBe(CouponStatus.EXPIRED)

    // context = await mockContext()
    await purgeExpiredCoupons(context.couponRepository)
    expect(await context.couponService.validateCoupon(userId, assignedCoupon.coupon.id)).toBe(CouponStatus.INVALID)
  })

  afterAll(async () => {
    await (await ORM.getInstance()).close()
  })
})
