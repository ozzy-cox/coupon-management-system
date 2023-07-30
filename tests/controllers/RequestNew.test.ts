import { app } from '@/app'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import request from 'supertest'
describe('Requesting a new coupon', () => {
  useTestContext()
  test('should return an error when a new coupon of requested type does not exist', async () => {
    const response = await request(app).get('/request-new').query({
      userId: 'userA-1',
      couponType: 'FREE'
    })

    expect(response.statusCode).toBe(500)
  })
})
