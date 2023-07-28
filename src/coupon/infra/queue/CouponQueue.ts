import { RateLimitedQueueOptions, rateLimitedCoupons } from '@/config'
import { CouponRequest, IRateLimitedCouponQueue } from '@/coupon/interfaces/IRateLimitedCouponQueue'
import { mockContext } from '@/mockContext'
import BeeQueue, { Job, QueueSettings } from 'bee-queue'

export class CouponQueueBee implements IRateLimitedCouponQueue {
  private lastRemoved: number

  constructor(public queue: BeeQueue<CouponRequest>, private options: RateLimitedQueueOptions) {
    queue.ready()
    this.lastRemoved = 1
  }

  async len(): Promise<number> {
    return parseInt((await this.queue.checkHealth()).newestJob || '0') - this.lastRemoved + 1
  }

  push(request: CouponRequest): void {
    this.queue.createJob(request).backoff('fixed', 200).timeout(this.options.canWait).save()
  }

  async pop(): Promise<CouponRequest> {
    const lastJobId = String(this.lastRemoved)
    const lastCreatedJob: Job<CouponRequest> = await this.queue.getJob(lastJobId)
    await this.queue.removeJob(lastJobId)
    this.lastRemoved++
    return lastCreatedJob.data
  }

  async quit() {
    await this.queue.close()
  }
  async clear(): Promise<void> {
    this.lastRemoved = 1
    await this.queue.destroy()
  }
}

const context = await mockContext()

export const couponQueues: Record<string, IRateLimitedCouponQueue> = Object.keys(rateLimitedCoupons).reduce(
  (acc, curr) => {
    return {
      ...acc,
      [curr]: new CouponQueueBee(
        new BeeQueue(curr, {
          redis: context.cache,
          isWorker: false
        } as QueueSettings),
        rateLimitedCoupons[curr]
      )
    }
  },
  {} as Record<string, IRateLimitedCouponQueue>
)
