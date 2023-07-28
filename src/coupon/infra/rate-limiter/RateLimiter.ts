import { ITokenRateLimiter } from '@/coupon/interfaces/ITokenRateLimiter'
import { RateLimiter as Limiter } from 'limiter'

export class TokenRateLimiter implements ITokenRateLimiter {
  interval: number
  tokensPerInterval: number

  limiter: Limiter

  constructor({ interval, tokensPerInterval }: { interval: number; tokensPerInterval: number }) {
    this.tokensPerInterval = tokensPerInterval
    this.interval = interval
    this.limiter = new Limiter({
      interval,
      tokensPerInterval,
      fireImmediately: true
    })
  }
  get tokens(): number {
    return this.limiter.getTokensRemaining()
  }
  async removeTokens(amount: number): Promise<number> {
    return await this.limiter.removeTokens(amount)
  }
}
