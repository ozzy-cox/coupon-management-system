import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { ConsoleLoggerFactory } from './ConsoleLogger'

const logger = ConsoleLoggerFactory.getInstance()

export function LogUsedCoupon() {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      try {
        const returnValue = (await targetMethod.apply(this, args)) as IUserCoupon
        logger.log(
          `Coupon "${returnValue.coupon.id}" with type "${returnValue.coupon.couponType}" redeemed by "${returnValue.userId}"`
        )

        return returnValue
      } catch (error: unknown) {
        logger.log(
          `"${args[0]}" attempted to redeem coupon with id "${args[1]}" but failed with "${(error as Error).message}"`
        )
        throw error
      }
    }

    return descriptor
  }
}
