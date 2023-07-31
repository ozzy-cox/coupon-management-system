import { app } from '@/app'
import { rateLimitedCoupons } from '@/config'
import { Context } from '@/context'
import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType } from '@/coupon/entities/ICoupon'
import { CouponQueueBee, CouponQueues } from '@/coupon/infra/queue/CouponQueue'
import { TokenRateLimiter } from '@/coupon/infra/rate-limiter/RateLimiter'
import { CouponRequestHandler } from '@/coupon/workers/CouponRequestHandler'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import assert from 'assert'
import { range } from 'lodash-es'
import request from 'supertest'
import { v4 } from 'uuid'

describe('Requesting a rate limited coupon', () => {
  const getContext = useTestContext()
  let context: Context
  let couponQueue: CouponQueueBee
  const couponType = CouponType.MEGADEAL
  let handler: CouponRequestHandler
  const rateLimitOptions = rateLimitedCoupons[CouponType.MEGADEAL]
  const limiter = new TokenRateLimiter({
    tokensPerInterval: rateLimitOptions.perSecondLimit,
    interval: rateLimitOptions.interval
  })

  const userId = 'userA-1'

  beforeAll(async () => {
    context = getContext()
    const couponQueues = await CouponQueues.getInstance()
    couponQueue = couponQueues.MEGADEAL as CouponQueueBee
    handler = new CouponRequestHandler(couponQueue, limiter, context)
  })

  beforeEach(async () => {
    await couponQueue.clear()
  })

  test('should request a rate limited coupon when coupon is available', async () => {
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
      userId,
      couponType
    })

    expect(response.statusCode).toBe(200)
    expect(response.body?.data?.trackingId).toBeDefined()
  })

  test('should request a rate limited coupon when queue is too crowded', async () => {
    const couponType = CouponType.MEGADEAL
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
        userId,
        couponType: CouponType.MEGADEAL
      })
    }

    const response = await request(app).get('/request-new').query({
      userId,
      couponType: CouponType.MEGADEAL
    })

    expect(response.statusCode).toBe(429)
  })

  test('should request a rate limited coupon when coupon is not available', async () => {
    const response = await request(app).get('/request-new').query({
      userId,
      couponType: CouponType.MEGADEAL
    })

    expect(response.statusCode).toBe(429)
  })

  test('should request and collect (later) a rate limited coupon when coupon is available', async () => {
    await request(app)
      .post('/upload')
      .send({
        coupons: range(30).map(
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
      userId,
      couponType
    })

    expect(response.body?.data?.trackingId).toBeDefined()
    assert(response.body?.data?.trackingId)

    let statusResponse = await request(app).get('/request-status').query({
      userId,
      trackingId: response.body.data.trackingId
    })

    expect(statusResponse.statusCode).toBe(202) // Coupon not allocated yet

    await handler.handle()

    statusResponse = await request(app).get('/request-status').query({
      userId,
      trackingId: response.body.data.trackingId
    })

    expect(statusResponse.statusCode).toBe(200) // Coupon should be ready
    expect(statusResponse.body?.data?.coupon).toBeDefined()
  })

  test('should request and collect (later) a rate limited coupon when coupon is available', async () => {
    await request(app)
      .post('/upload')
      .send({
        coupons: range(30).map(
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

    // Queue up 15 more requests, next coupon request should resolve a little later
    for (let i = 0; i < 15; i++) {
      request(app).get('/request-new').query({
        userId,
        couponType
      })
    }

    // Make a new coupon request
    const response = await request(app).get('/request-new').query({
      userId,
      couponType
    })

    let statusResponse = await request(app).get('/request-status').query({
      userId,
      trackingId: response.body.data.trackingId
    })

    expect(statusResponse.statusCode).toBe(202) // Coupon not allocated yet

    // Simulate the worker for approx. 2 more seconds
    for (let i = 0; i < 20; i++) {
      await handler.handle()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    statusResponse = await request(app).get('/request-status').query({
      userId,
      trackingId: response.body.data.trackingId
    })

    expect(statusResponse.statusCode).toBe(200) // Coupon should be ready
    expect(statusResponse.body?.data?.coupon).toBeDefined()
  })

  test('should try multiple times to collect a rate limited coupon', async () => {
    await request(app)
      .post('/upload')
      .send({
        coupons: range(100).map(
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

    // Queue up 50 more megadeal requests, next coupon request should be able to be resolved after 6 seconds
    for (let i = 0; i < 50; i++) {
      await context.couponService.requestCoupon(userId, couponType)
    }

    // Make our coupon request
    const response = await request(app).get('/request-new').query({
      userId,
      couponType
    })

    let statusResponse = await request(app).get('/request-status').query({
      userId,
      trackingId: response.body.data.trackingId
    })

    expect(statusResponse.statusCode).toBe(202) // Coupon not allocated yet

    // Since we are waiting 10 seconds, I thought to implement to retrial in the frontend
    // with linear backoff like "1, 2, 3, 4 -> fail" seconds between retries

    // Since we are 51th in the queue this should only take 3 tries
    for (let trial = 1; trial < 4; trial++) {
      const statusResponse = await request(app).get('/request-status').query({
        userId,
        trackingId: response.body.data.trackingId
      })

      expect(statusResponse.statusCode).toBe(202) // Coupon not allocated yet
      // Simulate the worker for approx. [trial] more seconds
      for (let i = 0; i < trial * 10; i++) {
        await handler.handle()
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    statusResponse = await request(app).get('/request-status').query({
      userId,
      trackingId: response.body.data.trackingId
    })

    expect(statusResponse.statusCode).toBe(200) // Coupon should be ready
    expect(statusResponse.body?.data?.coupon).toBeDefined()
  })
})
