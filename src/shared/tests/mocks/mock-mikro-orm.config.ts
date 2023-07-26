import { Coupon } from '@/coupon/infra/orm/models/Coupon'
import { UserCoupon } from '@/coupon/infra/orm/models/UserCoupon'
import { Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { SqliteDriver } from '@mikro-orm/sqlite'

export default {
  metadataProvider: TsMorphMetadataProvider,
  entities: [Coupon, UserCoupon],
  dbName: 'test.db',
  type: 'sqlite' // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
} as Options<SqliteDriver>
