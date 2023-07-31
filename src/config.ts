import { CouponType } from './coupon/entities/ICoupon'
import { FileLoggerFactory } from './shared/infra/logging/loggers/FileLogger'

export type RateLimitedQueueOptions = {
  concurrentLimit: number
  perSecondLimit: number
  canWait: number
  interval: number
}

const createdCouponCacheKey = 'createdCouponType'
const usedCouponCacheKey = 'usedCouponType'
const rateLimitedCoupons: Record<string, RateLimitedQueueOptions> = {
  [CouponType.MEGADEAL]: {
    concurrentLimit: 5, // There can be 5 simultaneous requests for this coupon ???
    perSecondLimit: 10, // 10 coupons will be given each second
    canWait: 10, //seconds
    interval: 1000
  }
}

const LOG_BUFFER_SIZE = 200
const LOG_FLUSH_THRESHOLD = 1

export enum LogTarget {
  FILE = 'FILE',
  CONSOLE = 'CONSOLE'
}

const LOG_TARGETS = [/*LogTarget.CONSOLE,*/ LogTarget.FILE]

const LOGGERS = {
  // [LogTarget.CONSOLE]: ConsoleLoggerFactory.getInstance(),
  [LogTarget.FILE]: FileLoggerFactory.getInstance()
}
const LOG_FILE_NAME = './log.txt'

const IS_DEBUG = true

const MAX_COUPON_UPLOAD = 50000

export {
  createdCouponCacheKey,
  usedCouponCacheKey,
  rateLimitedCoupons,
  LOG_BUFFER_SIZE,
  LOG_FLUSH_THRESHOLD,
  LOG_TARGETS,
  LOGGERS,
  LOG_FILE_NAME,
  IS_DEBUG,
  MAX_COUPON_UPLOAD
}
