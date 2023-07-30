import { LOG_BUFFER_SIZE, LOG_FLUSH_THRESHOLD } from '@/config'
import RingBuffer from 'ringbufferjs'
import { LogItem } from '../ILogger'

export abstract class BaseLogger {
  buffer: RingBuffer<LogItem>
  log(param: LogItem, flush = false): void {
    if (flush) {
      this.flush()
    } else {
      this.buffer.enq(param)
      if (this.buffer.size() > LOG_FLUSH_THRESHOLD) {
        this.flush()
      }
    }
  }

  // Stub, should be implemented by children.
  flush() {
    throw new Error('Method not implemented!')
  }

  constructor() {
    this.buffer = new RingBuffer(LOG_BUFFER_SIZE)
  }
}
