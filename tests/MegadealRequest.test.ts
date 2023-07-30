import { app } from '@/app'
import request from 'supertest'
import { rateLimitedCoupons } from '@/config'
import { Context } from '@/context'
import { CouponType, DiscountType } from '@/coupon/entities/ICoupon'
import { CouponQueueBee, CouponQueues } from '@/coupon/infra/queue/CouponQueue'
import { TokenRateLimiter } from '@/coupon/infra/rate-limiter/RateLimiter'
import { CouponRequestHandler } from '@/coupon/workers/CouponRequestHandler'
import { mockContext } from '@/mockContext'
import assert from 'assert'
import { isString } from 'lodash-es'
import { v4 } from 'uuid'

describe('Requesting a rate limited coupon (megadeal)', () => {
  let context: Context
  let couponQueue: CouponQueueBee
  let handler: CouponRequestHandler
  const now = new Date()
  const rateLimitOptions = rateLimitedCoupons[CouponType.MEGADEAL]
  const limiter = new TokenRateLimiter({
    tokensPerInterval: rateLimitOptions.perSecondLimit,
    interval: rateLimitOptions.interval
  })

  beforeAll(async () => {
    context = await mockContext()

    const couponQueues = await CouponQueues.getInstance()
    couponQueue = couponQueues.MEGADEAL as CouponQueueBee
    context = await mockContext()
    handler = new CouponRequestHandler(couponQueue, limiter, context)
  })

  beforeEach(async () => {
    await couponQueue.clear()
  })

  test('should make a request for a megadeal coupon and get a tracking id', async () => {
    const userId = 'userA-1'

    const trackingId = await context.couponService.requestCoupon(userId, CouponType.MEGADEAL)

    expect(isString(trackingId)).toBeTruthy()
  })

  test('should use the tracking id to check for the status of coupon allocation', async () => {
    const userId = 'userA-1'

    await context.couponService.saveCoupons([
      {
        couponCode: v4(),
        couponType: CouponType.MEGADEAL,
        discountAmount: 20,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 1),
        maxUsages: 5
      }
    ])
    const trackingId = await context.couponService.requestCoupon(userId, CouponType.MEGADEAL)
    assert(typeof trackingId === 'string')

    // Since there is no one in the queue now, the status check should result with a coupon assigned to the user

    await handler.handle()

    const coupon = await context.couponService.checkCouponRequestStatus(userId, trackingId)

    expect(coupon).toBeDefined()
    expect(coupon?.userId).toEqual(userId)
  })

  test('should fail to get a tracking id when there are too many people in the queue', async () => {
    //TODO
  })

  test('should fail to get a tracking id when there are no megadeal coupons left', async () => {
    //TODO
  })

  test('should try multiple times when the queue is long', async () => {
    //TODO
  })

  test('should be returning an error from redis when coupon allocation is unsuccessful', async () => {
    //TODO
  })

  test('should throw an error when more than 5 concurrent requests are sent', async () => {
    for (let i = 0; i < rateLimitedCoupons[CouponType.MEGADEAL].concurrentLimit; i++) {
      await request(app).get('/request-new').query({
        userId: 'userA-1',
        couponType: CouponType.MEGADEAL
      })
    }
    const res = await request(app).get('/request-new').query({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })

    expect(res.statusCode).toBe(429)
  })

  afterAll(async () => {
    await couponQueue.quit()
  })
})
