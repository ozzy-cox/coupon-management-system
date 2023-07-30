import { MAX_COUPON_UPLOAD } from '@/config'
import { CouponType } from '@/coupon/entities/ICoupon'
import { validate } from '@/coupon/middlewares/ValidationError'
import { body, query } from 'express-validator'

const uploadValidationRules = () => {
  return [body('coupons').isArray().isLength({ min: 1, max: MAX_COUPON_UPLOAD }), validate]
}

const requestNewValidationRules = () => {
  return [
    query('userId').isString().notEmpty(),
    query('couponType')
      .optional()
      .customSanitizer((value) => (value ? value : CouponType.NONE))
      .isIn(Object.values(CouponType)),
    validate
  ]
}

const redeemValidationRules = () => {
  return [body('userId').notEmpty(), body('couponCode').notEmpty(), validate]
}

const validateValidationRules = () => {
  return [query('userId').notEmpty(), query('couponCode').notEmpty(), validate]
}

const requestStatusValidationRules = () => {
  return [query('userId').notEmpty(), query('trackingId').notEmpty(), validate]
}

export {
  uploadValidationRules,
  requestNewValidationRules,
  validateValidationRules,
  redeemValidationRules,
  requestStatusValidationRules
}
