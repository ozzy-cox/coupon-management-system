export interface ITokenRateLimiter {
  interval: number
  tokensPerInterval: number
  get tokens(): number
  removeTokens(amount: number): Promise<number>
}
