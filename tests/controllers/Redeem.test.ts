import { app } from '@/app'
import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType } from '@/coupon/entities/ICoupon'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import assert from 'assert'
import { range } from 'lodash-es'
import request from 'supertest'
import { v4 } from 'uuid'
describe('Redeeming coupons', () => {
  const userId = 'userA-1'
  useTestContext()
  test('should redeem a coupon', async () => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 100000)
    await request(app)
      .post('/upload')
      .send({
        coupons: range(5).map(
          () =>
            ({
              couponCode: v4(),
              couponType: CouponType.STANDARD,
              discountAmount: 20,
              discountType: DiscountType.FLAT,
              expiryDate,
              maxUsages: 1
            } as CouponParams)
        )
      })

    const requestedCoupon = await request(app).get('/request-new').query({
      userId,
      couponType: CouponType.STANDARD
    })

    assert(requestedCoupon.body?.data?.coupon?.couponCode)
    let userCoupon = requestedCoupon.body.data
    expect(userCoupon.usages + 1).toEqual(userCoupon.coupon.maxUsages)

    const couponCode = requestedCoupon.body.data.coupon.couponCode

    const redeemedResponse = await request(app).post('/redeem').send({
      userId,
      couponCode
    })

    assert(redeemedResponse.body?.data?.coupon?.couponCode)
    userCoupon = redeemedResponse.body.data
    expect(userCoupon.usages).toEqual(userCoupon.coupon.maxUsages)
  })
})
