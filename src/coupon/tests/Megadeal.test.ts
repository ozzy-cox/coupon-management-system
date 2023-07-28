import { CouponType, DiscountType } from '../entities/ICoupon'
import { Context } from '@/context'
import { mockContext } from '@/mockContext'
import { CouponQueueBee, couponQueues } from '../infra/queue/CouponQueue'
import { CouponRequestHandler } from '../workers/CouponRequestHandler'
import { TokenRateLimiter } from '../infra/rate-limiter/RateLimiter'
import { rateLimitedCoupons } from '@/config'
import { CouponParams } from '../controllers/CouponController'
import { v4 } from 'uuid'
import exp from 'constants'

describe('Using the rate limited coupon queues', () => {
  let couponQueue: CouponQueueBee
  let context: Context
  let handler: CouponRequestHandler
  const now = new Date()
  const rateLimitOptions = rateLimitedCoupons[CouponType.MEGADEAL]
  const limiter = new TokenRateLimiter({
    tokensPerInterval: rateLimitOptions.perSecond,
    interval: rateLimitOptions.interval
  })

  beforeAll(async () => {
    couponQueue = couponQueues.MEGADEAL as CouponQueueBee
    context = await mockContext()
    handler = new CouponRequestHandler(couponQueue, limiter, context)
  })

  beforeEach(async () => {
    await couponQueue.clear()
  })

  test('should add requests to the queue', async () => {
    couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })
    couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })
    expect(await couponQueue.len()).toBe(2)
  })

  test('should pop requests out of the queue', async () => {
    await couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })
    await couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL
    })
    await couponQueue.pop()
    await couponQueue.pop()

    expect(await couponQueue.len()).toBe(0)
  })

  test('should assign a request when rate limit is not exceeded and there are enough coupons', async () => {
    const requestCount = 45
    const availableCouponCount = 200
    const couponsToSave: CouponParams[] = []

    // Add some coupons
    for (let i = 0; i < availableCouponCount; i++) {
      couponsToSave.push({
        couponCode: v4(),
        couponType: CouponType.MEGADEAL,
        discountAmount: 20,
        discountType: DiscountType.FLAT,
        expiryDate: new Date(now.getTime() + 1),
        maxUsages: 5
      })
    }

    // Add coupon requests
    for (let i = 0; i < requestCount; i++) {
      await couponQueue.push({
        userId: 'userA-1',
        couponType: CouponType.MEGADEAL
      })
    }

    await context.couponService.saveCoupons(couponsToSave)

    await handler.handle()
    expect(await couponQueue.len()).toBe(requestCount - rateLimitOptions.perSecond)

    // Simulate the worker for approx. 3 more seconds
    for (let i = 0; i < 30; i++) {
      await handler.handle()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    expect(await couponQueue.len()).toBe(0)
  })

  test('should return error when there are no coupons left', () => {
    //
  })

  afterAll(async () => {
    await couponQueue.quit()
    await context.orm.close()
  })
})
