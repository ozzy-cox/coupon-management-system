import config from '@/shared/tests/mocks/mock-mikro-orm.config'
import { MikroORM, SqliteDriver } from '@mikro-orm/sqlite'

export class ORM {
  private static instance?: MikroORM

  public static getInstance = async () => {
    if (!ORM.instance) {
      ORM.instance = await MikroORM.init<SqliteDriver>(config)
    } else if (!(await ORM.instance.isConnected())) {
      await ORM.instance.connect()
    }
    return ORM.instance
  }
}

export const wipeDb = async () => {
  const orm = await ORM.getInstance()
  await orm.getSchemaGenerator().refreshDatabase()
}
