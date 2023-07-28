import { mockContext } from '@/mockContext'
import { ICoupon } from '../entities/ICoupon'
import { IUserCoupon } from '../entities/IUserCoupon'
import { createdCouponCacheKey, usedCouponCacheKey } from '@/config'

export function UpdateCreatedCouponCounts() {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const createdCoupons: ICoupon[] = await targetMethod.apply(this, args)

      try {
        const context = await mockContext()

        for (let i = 0; i < createdCoupons.length; i++) {
          const coupon = createdCoupons[i]
          await context.cache.incr(`${createdCouponCacheKey}-${coupon.couponType}`)
        }
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        return createdCoupons
      }
    }

    return descriptor
  }
}

export function UpdateUsedCouponCounts() {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const context = await mockContext()
      const usedCoupon: IUserCoupon = await targetMethod.apply(this, args)

      await context.cache.incr(`${usedCouponCacheKey}-${usedCoupon.coupon.couponType}`)

      return usedCoupon
    }

    return descriptor
  }
}
