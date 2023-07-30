export type LogItem = {
  content: unknown
  time: Date
  context: unknown
}

export interface ILogger {
  log(param: LogItem, flush?: boolean): void
  flush(): void
}
