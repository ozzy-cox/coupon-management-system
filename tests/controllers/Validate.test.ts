import { app } from '@/app'
import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType } from '@/coupon/entities/ICoupon'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import { range } from 'lodash-es'
import request from 'supertest'
import { v4 } from 'uuid'

describe('Validating coupons', () => {
  useTestContext()
  test('Should be invalid when the coupon code is not found', async () => {
    const response = await request(app).get('/validate').query({
      userId: 'userA-1',
      couponCode: 'th1sC0up0nD035nT3X15T'
    })

    expect(response.statusCode).toBe(400)
  })

  test('Should valid when the coupon code is valid', async () => {
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
      userId: 'userA-1',
      couponType: CouponType.STANDARD
    })

    const couponCode = requestedCoupon.body.data.coupon.couponCode

    const response = await request(app).get('/validate').query({
      userId: 'userA-1',
      couponCode: couponCode
    })

    expect(response.statusCode).toBe(200)
  })
})
