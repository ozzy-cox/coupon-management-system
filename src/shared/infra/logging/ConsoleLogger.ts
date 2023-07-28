import { ILogger } from '@/shared/interfaces/ILogger'

export class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(message)
  }
}

let logger: ILogger
export class ConsoleLoggerFactory {
  public static getInstance(): ILogger {
    if (!logger) {
      logger = new ConsoleLogger()
    }
    return logger
  }
}
