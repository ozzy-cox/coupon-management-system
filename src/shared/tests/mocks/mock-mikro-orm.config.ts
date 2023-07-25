import { Coupon } from '@/coupon/infra/orm/models/Coupon'
import { Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { SqliteDriver } from '@mikro-orm/sqlite'

export default {
  metadataProvider: TsMorphMetadataProvider,
  entities: [Coupon],
  dbName: 'test.db',
  type: 'sqlite' // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
} as Options<SqliteDriver>
