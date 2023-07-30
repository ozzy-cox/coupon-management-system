import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { LogStrategy } from './LogStrategy'
import { LOGGERS } from '@/config'

const logger = new LogStrategy(Object.values(LOGGERS))

export function LogUsedCoupon() {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const returnValue = (await targetMethod.apply(this, args)) as IUserCoupon
      logger.log({
        content: {
          couponCode: returnValue.coupon.couponCode,
          couponType: returnValue.coupon.couponType,
          userId: returnValue.userId
        },
        time: new Date(),
        context: undefined
      })
      return returnValue
    }

    return descriptor
  }
}
