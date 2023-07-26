import { ORM, wipeDb } from '@/shared/tests/mocks/orm'
import { CouponRepository } from '../infra/orm/repositories/CouponRepository'
import { CouponType, DiscountType, ICoupon } from '../entities/ICoupon'
import { CouponParams } from '../controllers/CouponController'
import { before } from 'node:test'
import { CouponService, CouponStatus } from '../services/CouponService'

describe('Assigning a coupon to a user', () => {
  let couponResponse: ICoupon[]
  let couponRepo: CouponRepository
  let couponService: CouponService
  const userId = 'userA-1'

  beforeAll(async () => {
    const orm = await ORM.getInstance()
    const em = await orm.em.fork()
    couponRepo = new CouponRepository(em)
    couponService = new CouponService(couponRepo)
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

    couponResponse = await couponRepo.persistCoupons(coupons)
  })

  test('should create and assign a coupon to a user', async () => {
    const assignedCoupon = await couponRepo.assignCoupon(userId, null)

    expect(assignedCoupon.coupon).toEqual(couponResponse[0])
  })

  test('should attempt to assign a coupon to a user when type of coupon is not available', async () => {
    const assignCoupon = async () => {
      await couponRepo.assignCoupon(userId, CouponType.MEGADEAL)
    }
    await expect(assignCoupon).rejects.toThrow()
  })

  test('should validate an assigned coupon', async () => {
    const assignedCoupon = await couponRepo.assignCoupon(userId, null)

    const isValid = await couponService.validateCoupon(userId, assignedCoupon.coupon.id)

    expect(isValid).toBeTruthy()
  })

  test('should attempt to validate an expired coupon', async () => {
    const assignedCoupon = await couponRepo.assignCoupon(userId, CouponType.STANDARD) // Only standard type coupon is expired

    const isValid = await couponService.validateCoupon(userId, assignedCoupon.coupon.id)

    expect(isValid).toEqual(CouponStatus.EXPIRED)
  })

  test('should attempt to validate an exhausted coupon', async () => {
    const assignedCoupon = await couponRepo.assignCoupon(userId, CouponType.FREE) // Free coupon is already exhausted

    const isValid = await couponService.validateCoupon(userId, assignedCoupon.coupon.id)

    expect(isValid).toEqual(CouponStatus.EXHAUSTED)
  })

  afterAll(async () => {
    await (await ORM.getInstance()).close()
  })
})
