import { app } from '@/app'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import request from 'supertest'

describe('Validating coupons', () => {
  useTestContext()
  test('Should be invalid when the coupon code is not found', async () => {
    const response = await request(app).get('/validate').query({
      userId: 'userA-1',
      couponCode: 'th1sC0up0nD035nT3X15T'
    })

    expect(response.statusCode).toBe(400)
  })
})
