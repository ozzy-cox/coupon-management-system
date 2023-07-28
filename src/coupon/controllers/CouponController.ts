import { Request, Response } from 'express'
import { ICoupon } from '../entities/ICoupon'

export type CouponParams = Omit<ICoupon, 'id' | 'createdAt'>

export const uploadCoupons = async (req: Request, res: Response) => {
  /** */
}

export const requestNewCoupon = async (req: Request, res: Response) => {
  /** */
}

export const redeemCoupon = async (req: Request, res: Response) => {
  /** */
}

export const validateCoupon = async (req: Request, res: Response) => {
  /** */
}

export const queryCouponRequestStatus = async (req: Request, res: Response) => {
  /** */
}
