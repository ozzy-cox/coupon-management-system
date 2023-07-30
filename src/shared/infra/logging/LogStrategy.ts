import { ILogger, LogItem } from './ILogger'
import { BaseLogger } from './loggers/BaseLogger'

export class LogStrategy implements ILogger {
  constructor(private loggers: BaseLogger[]) {}
  log(param: LogItem, flush?: boolean): void {
    this.loggers.forEach((logger) => logger.log(param, flush))
  }

  flush(): void {
    this.loggers.forEach((logger) => logger.flush())
  }
}
