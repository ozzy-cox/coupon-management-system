import { ILogger } from '@/shared/interfaces/ILogger'

export class FileLogger implements ILogger {
  log(message: string): void {
    throw new Error('Method not implemented.')
  }
}
