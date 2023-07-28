import { ICouponRepository } from '../interfaces/ICouponRepository'

export const purgeExpiredCoupons = async (couponRepository: ICouponRepository) => {
  const removedCoupons = await couponRepository.removeExpiredCoupons()
  return removedCoupons
}
