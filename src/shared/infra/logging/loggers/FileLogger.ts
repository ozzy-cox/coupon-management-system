import { LOG_FILE_NAME } from '@/config'
import { BaseLogger } from './BaseLogger'
import fs from 'fs'

export class FileLogger extends BaseLogger {
  flush(): void {
    const stream = fs.createWriteStream(LOG_FILE_NAME, { flags: 'a' })
    for (let i = 0; i < this.buffer.size(); i++) {
      const logItem = this.buffer.deq()
      stream.write(JSON.stringify(logItem, null, 2) + '\n')
    }
  }
}

let logger: BaseLogger
export class FileLoggerFactory {
  public static getInstance(): BaseLogger {
    if (!logger) {
      logger = new FileLogger()
    }
    return logger
  }
}
