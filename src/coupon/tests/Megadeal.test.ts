import { CouponType, DiscountType } from '../entities/ICoupon'
import { Context } from '@/context'
import { CouponQueueBee, CouponQueues } from '../infra/queue/CouponQueue'
import { CouponRequestHandler } from '../workers/CouponRequestHandler'
import { TokenRateLimiter } from '../infra/rate-limiter/RateLimiter'
import { rateLimitedCoupons } from '@/config'
import { CouponParams } from '../controllers/CouponController'
import { v4 } from 'uuid'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'

describe('Using the rate limited coupon queues', () => {
  const getContext = useTestContext()
  let context: Context

  let couponQueue: CouponQueueBee
  let handler: CouponRequestHandler
  const now = new Date()
  const rateLimitOptions = rateLimitedCoupons[CouponType.MEGADEAL]
  const limiter = new TokenRateLimiter({
    tokensPerInterval: rateLimitOptions.perSecondLimit,
    interval: rateLimitOptions.interval
  })

  beforeAll(() => {
    context = getContext()
  })

  beforeAll(async () => {
    const couponQueues = await CouponQueues.getInstance()
    couponQueue = couponQueues.MEGADEAL as CouponQueueBee
    handler = new CouponRequestHandler(couponQueue, limiter, context)
  })

  beforeEach(async () => {
    await couponQueue.clear()
  })

  test('should add requests to the queue', async () => {
    couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL,
      trackingId: v4()
    })
    couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL,
      trackingId: v4()
    })
    expect(await couponQueue.len()).toBe(2)
  })

  test('should pop requests out of the queue', async () => {
    await couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL,

      trackingId: v4()
    })
    await couponQueue.push({
      userId: 'userA-1',
      couponType: CouponType.MEGADEAL,
      trackingId: v4()
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

    const trackingId = v4()

    // Add coupon requests
    for (let i = 0; i < requestCount; i++) {
      await couponQueue.push({
        userId: 'userA-1',
        couponType: CouponType.MEGADEAL,
        trackingId
      })
    }

    await context.couponService.saveCoupons(couponsToSave)

    await handler.handle()
    expect(await couponQueue.len()).toBe(requestCount - rateLimitOptions.perSecondLimit)

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
