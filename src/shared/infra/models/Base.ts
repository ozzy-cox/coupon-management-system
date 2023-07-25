import { IBase } from '@/shared/entities/IBase'
import { PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'

export abstract class Base implements IBase {
  @PrimaryKey()
  id: string = v4()

  @Property()
  createdAt = new Date()
}
