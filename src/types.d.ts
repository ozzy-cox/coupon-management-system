import { Context } from './context'

declare global {
  namespace Express {
    interface Request {
      context: Context
    }
  }
}

export type UserIdType = string
export type CouponAllocationIdType = string
