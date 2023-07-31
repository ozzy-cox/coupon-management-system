import { CouponParams } from '@/coupon/controllers/CouponController'
import { CouponType, ICoupon } from '@/coupon/entities/ICoupon'
import { ICouponRepository } from '@/coupon/interfaces/ICouponRepository'
import { EntityManager, SqlEntityRepository } from '@mikro-orm/sqlite'
import { Coupon } from '../models/Coupon'
import { IUserCoupon } from '@/coupon/entities/IUserCoupon'
import { UserCoupon } from '../models/UserCoupon'
import { CouponAllocationIdType, UserIdType } from '@/types'
import Redis from 'ioredis'
import { rateLimitedCoupons } from '@/config'
import { HTTPError } from '@/coupon/helpers/HTTPError'

export class CouponRepository implements ICouponRepository {
  private couponRepository: SqlEntityRepository<Coupon>
  private userCouponRepository: SqlEntityRepository<UserCoupon>
  private cache: Redis
  private em: EntityManager

  constructor(em: EntityManager, cache: Redis) {
    this.couponRepository = em.getRepository(Coupon)
    this.userCouponRepository = em.getRepository(UserCoupon)
    this.em = em
    this.cache = cache
  }

  async assignCouponById(userId: string, couponId: string): Promise<IUserCoupon> {
    const assignedCoupon = (await this.getCoupons([couponId]))[0]
    const userCoupon: IUserCoupon = new UserCoupon({ userId })
    userCoupon.coupon = assignedCoupon
    this.em.persist(userCoupon)
    await this.em.flush()
    return userCoupon
  }

  async removeExpiredCoupons(): Promise<ICoupon[]> {
    const expiredCoupons = await this.couponRepository.find({ expiryDate: { $lt: new Date() } })
    await this.em.remove(expiredCoupons)
    await this.em.flush()
    return expiredCoupons
  }

  async getCoupons(couponIds: string[]): Promise<ICoupon[]> {
    return await this.couponRepository.find({ id: { $in: couponIds } }, { cache: true })
  }

  async getCouponsByCode(couponCodes: ICoupon['couponCode'][]): Promise<ICoupon[]> {
    return await this.couponRepository.find(
      {
        couponCode: { $in: couponCodes }
      },
      { cache: true }
    )
  }

  async persistCoupons(couponParams: CouponParams[]): Promise<ICoupon[]> {
    const coupons: ICoupon[] = []
    for (let i = 0; i < couponParams.length; i++) {
      const coupon = new Coupon(couponParams[i])
      this.em.persist(coupon)
      coupons.push(coupon)
    }
    await this.em.flush()

    return coupons
  }

  async assignCoupon(userId: string, couponType: ICoupon['couponType']): Promise<IUserCoupon> {
    const nextAvailableCoupon = await this.getNextAvailableCouponByType(couponType)
    if (nextAvailableCoupon) {
      const userCoupon: IUserCoupon = new UserCoupon({ userId })
      userCoupon.coupon = nextAvailableCoupon
      this.em.persist(userCoupon)
      await this.em.flush()
      return userCoupon
    } else {
      throw new Error('No available coupons')
    }
  }

  async getUserCoupons(
    userId: string,
    couponCodes: ICoupon['couponCode'][]
  ): Promise<IUserCoupon[]> {
    return await this.userCouponRepository.find({
      coupon: { couponCode: { $in: couponCodes } },
      userId
    })
  }

  async updateCouponUsages(
    userId: UserIdType,
    couponCode: ICoupon['couponCode']
  ): Promise<IUserCoupon> {
    const userCouponResponse = await this.getUserCoupons(userId, [couponCode])
    if (userCouponResponse.length) {
      const userCoupon = userCouponResponse[0]
      userCoupon.usages++
      this.em.persist(userCoupon)
      await this.em.flush()
      return userCoupon
    } else {
      throw new Error('Coupon not found')
    }
  }

  async getNextAvailableCouponByType(couponType: ICoupon['couponType']): Promise<ICoupon> {
    const coupon = await this.couponRepository.findOne({
      $or: [
        {
          allocatedUntil: {
            $lt: new Date()
          }
        },
        {
          allocatedUntil: null
        }
      ],
      couponType: couponType,
      assignedUser: null
    })
    if (coupon) {
      return coupon
    } else {
      throw new Error(`No available coupon of type ${couponType}`)
    }
  }

  async checkCouponRequestStatus(
    userId: UserIdType,
    trackingId: CouponAllocationIdType
  ): Promise<IUserCoupon | undefined> {
    const result = await this.cache.get(trackingId)
    let parsed
    if (result) {
      parsed = JSON.parse(result) as {
        userId: UserIdType
        couponId: ICoupon['id']
      }
    } else {
      // TODO order in the queue for user can be returned
      throw new HTTPError('Coupon not ready yet. Try again later.', 202)
    }
    if ('error' in parsed) {
      throw new HTTPError('Unexpected error in assigning coupon', 500)
    }
    const allocatedCouponId = parsed?.couponId
    if (allocatedCouponId) {
      const userCoupon = await this.assignCouponById(userId, allocatedCouponId)
      return userCoupon
    }
    return
  }

  async allocateCoupon(
    userId: UserIdType,
    couponType: ICoupon['couponType'],
    trackingId: string
  ): Promise<CouponAllocationIdType> {
    const coupon = await this.getNextAvailableCouponByType(couponType)
    // Flag the coupon allocated
    const tenSecondsLater = new Date()
    tenSecondsLater.setSeconds(tenSecondsLater.getSeconds() + 10)
    coupon.allocatedUntil = tenSecondsLater
    this.em.persist(coupon)
    await this.em.flush()

    await this.cache.set(
      trackingId,
      JSON.stringify({
        userId,
        couponId: coupon.id
      }),
      'EX',
      // HACK explicit null key for coupon type, should be made explicit in the config as well
      rateLimitedCoupons[couponType || 'null'].canWait
    )

    return trackingId
  }

  async getCouponCounts(couponType: CouponType): Promise<number> {
    return await this.couponRepository.count({
      $or: [
        {
          allocatedUntil: {
            $lt: new Date()
          }
        },
        {
          allocatedUntil: null
        }
      ],
      couponType: couponType,
      assignedUser: null
    })
  }
}
