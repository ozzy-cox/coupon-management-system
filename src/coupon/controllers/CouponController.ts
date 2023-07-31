import { NextFunction, Request, Response } from 'express'
import { CouponType, ICoupon } from '../entities/ICoupon'
import { rateLimitedCoupons } from '@/config'
import { UserIdType } from '@/types'
import { CouponStatus } from '../services/CouponService'
import { HTTPError } from '../helpers/HTTPError'

export type CouponParams = Omit<ICoupon, 'id' | 'createdAt'>

export const uploadCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = req.context
    const couponParams = req.body?.coupons as CouponParams[]
    const results: { [key: string]: ICoupon } = {}
    const createdCoupons = await context.couponService.saveCoupons(couponParams)
    createdCoupons.forEach((coupon) => {
      results[coupon.couponCode] = coupon
    })

    res.json({
      coupons: results
    })
  } catch (e) {
    next(e)
  }
}

export const requestNewCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = req.context
    const { userId, couponType } = req.query as {
      userId: UserIdType
      couponType: CouponType
    }
    if (couponType in rateLimitedCoupons) {
      const rateLimiter = context.concurrentRequestRateLimiters[couponType]
      if (rateLimiter.tryIncrement()) {
        const trackingId = await context.couponService.requestCoupon(userId, couponType)
        res.json({
          data: {
            trackingId
          }
        })
      } else {
        next(new HTTPError('Rate limit reached', 429))
      }
    } else {
      const coupon = await context.couponService.requestCoupon(userId, couponType)
      res.json({
        data: coupon
      })
    }
  } catch (e) {
    next(e)
  }
}

export const redeemCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = req.context
    const { userId, couponId } = req.body
    const coupon = await context.couponService.redeemCoupon(userId, couponId)
    res.json({
      data: coupon
    })
  } catch (e) {
    next(e)
  }
}

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = req.context
    const { userId, couponId } = req.body
    const couponStatus = await context.couponService.validateCoupon(userId, couponId)
    if (typeof couponStatus === 'object') {
      res.json({
        data: couponStatus
      })
    } else {
      switch (couponStatus) {
        case CouponStatus.EXPIRED:
          next(new HTTPError('Coupon expired', 410))
          break
        case CouponStatus.EXHAUSTED:
          next(new HTTPError('Coupon exhausted', 429))
          break
        default:
          next(new HTTPError('Coupon invalid', 400))
          break
      }
    }
  } catch (e) {
    next(e)
  }
}

export const queryCouponRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = req.context
    const { userId, trackingId } = req.body
    const requestStatus = await context.couponService.checkCouponRequestStatus(userId, trackingId)
    res.json({
      data: {
        status: requestStatus
      }
    })
  } catch (e) {
    next(e)
  }
}
