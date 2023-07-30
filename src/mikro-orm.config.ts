import { Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { SqliteDriver } from '@mikro-orm/sqlite'
import { RedisCacheAdapter } from 'mikro-orm-cache-adapter-redis'
import { Coupon } from './coupon/infra/orm/models/Coupon'
import { UserCoupon } from './coupon/infra/orm/models/UserCoupon'

export default {
  metadataProvider: TsMorphMetadataProvider,
  entities: [Coupon, UserCoupon],
  dbName: 'test.db',
  type: 'sqlite', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  resultCache: {
    adapter: RedisCacheAdapter,
    expiration: 1000,
    options: {
      // Base options
      // An optional key prefix. By default is `mikro`
      keyPrefix: 'mikro',
      // Optional: print debug informations
      debug: false,

      // Here goes IORedis connection options (the library will instantiate the client)
      host: '127.0.0.1',
      port: 6379
    }
  }
} as Options<SqliteDriver>
