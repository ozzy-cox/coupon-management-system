import { app } from '@/app'
import { Context } from '@/context'
import { CouponParams } from '@/coupon/controllers/CouponController'
import { uploadValidationRules } from '@/coupon/controllers/validation/CouponControllerRules'
import { CouponType, DiscountType } from '@/coupon/entities/ICoupon'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import { get } from 'http'
import { range } from 'lodash-es'
import request from 'supertest'
import { v4 } from 'uuid'
describe('Requesting a rate limited coupon', () => {
  const getContext = useTestContext()
  let context: Context
  const couponType = CouponType.MEGADEAL

  beforeAll(() => {
    context = getContext()
  })

  beforeEach(() => {
    context.concurrentRequestRateLimiters.MEGADEAL.clear()
  })

  test('should request a rate limited coupon when coupon is available', async () => {
    // Create 5 coupons
    await request(app)
      .post('/upload')
      .send({
        coupons: range(5).map(
          () =>
            ({
              couponCode: v4(),
              couponType,
              discountAmount: 20,
              discountType: DiscountType.FLAT,
              expiryDate: new Date(),
              maxUsages: 1
            } as CouponParams)
        )
      })

    const response = await request(app).get('/request-new').query({
      userId: 'userA-1',
      couponType
    })

    expect(response.statusCode).toBe(200)
    expect(response.body?.data?.trackingId).toBeDefined()
  })

  test('should request a rate limited coupon when queue is too crowded', async () => {
    const couponType = CouponType.MEGADEAL
    // Create 200 coupons
    await request(app)
      .post('/upload')
      .send({
        coupons: range(200).map(
          () =>
            ({
              couponCode: v4(),
              couponType,
              discountAmount: 20,
              discountType: DiscountType.FLAT,
              expiryDate: new Date(),
              maxUsages: 1
            } as CouponParams)
        )
      })

    for (let i = 0; i < 100; i++) {
      await request(app).get('/request-new').query({
        userId: 'userA-1',
        couponType: CouponType.MEGADEAL
      })
    }

    const response = await request(app).get('/request-new').query({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })

    expect(response.statusCode).toBe(429)
  })

  test('should request a rate limited coupon when coupon is not available', async () => {
    const response = await request(app).get('/request-new').query({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })

    expect(response.statusCode).toBe(429)
  })

  test('should request and collect (later) a rate limited coupon when coupon is available', async () => {
    // TODO
    // Create 10 coupons
    await request(app)
      .post('/upload')
      .send({
        coupons: range(15).map(
          () =>
            ({
              couponCode: v4(),
              couponType,
              discountAmount: 20,
              discountType: DiscountType.FLAT,
              expiryDate: new Date(),
              maxUsages: 1
            } as CouponParams)
        )
      })

    context.concurrentRequestRateLimiters.MEGADEAL.clear()
    const response = await request(app).get('/request-new').query({
      userId: 'userA-1',
      couponType
    })

    console.log(response.body)
    expect(response.body?.data?.trackingId).toBeDefined()
  })
})
