import { IS_DEBUG } from '@/config'
import pino from 'pino'

const transports = pino.transport({
  targets: [
    ...(IS_DEBUG
      ? [
          {
            level: 'trace',
            target: 'pino-pretty',
            options: {
              colorize: true,
              destination: './app_debug.txt',
              all: true,
              translateTime: true
            }
          }
        ]
      : []),
    {
      level: 'info',
      target: 'pino-http-print',
      options: {
        destination: './app_log.txt',
        all: true,
        translateTime: true
      }
    },
    {
      level: 'info',
      target: 'pino-http-print',
      options: {
        destination: 1,
        all: true,
        translateTime: true
      }
    }
  ]
})
export const logger = pino(transports)
