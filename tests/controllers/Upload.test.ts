import { app } from '@/app'
import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, DiscountType } from '@/coupon/entities/ICoupon'
import { useTestContext } from '@/shared/tests/hooks/useMockContext'
import { range } from 'lodash-es'
import request from 'supertest'
import { v4 } from 'uuid'

describe('Upload controller', () => {
  useTestContext()
  test('should not accept more than 50000 coupons', async () => {
    const response = await request(app)
      .post('/upload')
      .send(
        range(50001).map(
          () =>
            ({
              couponCode: v4(),
              couponType: CouponType.STANDARD,
              discountAmount: 20,
              discountType: DiscountType.FLAT,
              expiryDate: new Date(),
              maxUsages: 1
            } as CouponParams)
        )
      )

    expect(response.statusCode).toBe(413)
  })
})
