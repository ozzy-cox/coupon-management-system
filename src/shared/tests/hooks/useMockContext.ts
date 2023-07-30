import { Context } from '@/context'
import { CouponQueues } from '@/coupon/infra/queue/CouponQueue'
import { mockContext } from '@/mockContext'
import { wipeDb } from '@/shared/tests/mocks/orm'

export const useTestContext = () => {
  let context: Context
  beforeAll(async () => {
    context = await mockContext()
  })

  beforeEach(async () => {
    await wipeDb()
  })

  afterAll(async () => {
    const couponQueues = await CouponQueues.getInstance()
    await couponQueues.MEGADEAL.quit()
    await context.orm.close()
  })
  return () => context
}
