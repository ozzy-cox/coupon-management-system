import { ORM, wipeDb } from '@/shared/tests/mocks/orm'
import { CouponType, DiscountType, ICoupon } from '../entities/ICoupon'
import { CouponRepository } from '../infra/orm/repositories/CouponRepository'
import { CouponService } from '../services/CouponService'
import { CouponParams } from '../controllers/CouponController'
import { assignIn } from 'lodash-es'

describe('Redeeming coupons', () => {
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
        couponType: CouponType.STANDARD,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 100000),
        maxUsages: 3
      }
    ]

    couponResponse = await couponRepo.persistCoupons(coupons)
  })
  test('should redeem a coupon succesfully', async () => {
    const assignedCoupon = await couponRepo.assignCoupon(userId, CouponType.STANDARD)
    const assignedCouponUsages = assignedCoupon.usages

    const redeemedCoupon = await couponService.redeemCoupon(userId, assignedCoupon.coupon.id)

    const redeemedCouponUsages = redeemedCoupon.usages

    expect(assignedCouponUsages).toEqual(redeemedCouponUsages - 1)
  })
  //   test('should attempt to redeem a coupon that is expired', () => {
  //     second
  //   })
  //   test('should attempt to redeem a coupon that exceeded max usages', () => {
  //     second
  //   })
  //   test('should attempt to redeem a coupon that is not assigned to this user', () => {
  //     second
  //   })
  //

  afterAll(async () => {
    await (await ORM.getInstance()).close()
  })
})
