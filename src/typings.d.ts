declare module 'redis' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ClientOpts {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface RedisClient {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createClient(...args: any[]): any
}
