// TODO This is another mock, should use redis with atomic operations to support concurrent nodes.
export class ConcurrentRateLimiter {
  count: number
  constructor(private limit: number) {
    this.count = 0
  }
  tryIncrement(): boolean {
    if (this.count < this.limit) {
      this.count++
      return true
    } else {
      return false
    }
  }

  decrement(): void {
    this.count--
  }
}
