import { BaseLogger } from './BaseLogger'

export class ConsoleLogger extends BaseLogger {
  flush(): void {
    for (let i = 0; i < this.buffer.size(); i++) {
      const logItem = this.buffer.deq()
      console.log(logItem)
    }
  }
}

let logger: BaseLogger
export class ConsoleLoggerFactory {
  public static getInstance(): BaseLogger {
    if (!logger) {
      logger = new ConsoleLogger()
    }
    return logger
  }
}
