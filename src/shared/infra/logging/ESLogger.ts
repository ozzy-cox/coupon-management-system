import { ILogger } from '@/shared/interfaces/ILogger'

// TODO Since the log interface is defined, the impl. can and should be done to send the logs to a
// proper logging handler where analysis and monitoring can be done, like ElasticSearch.
export class ESLogger implements ILogger {
  log(message: string): void {
    throw new Error('Method not implemented.')
  }
}
