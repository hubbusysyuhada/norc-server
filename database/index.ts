import env from "../helpers/env";
import { MikroORM, UnderscoreNamingStrategy } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { MySqlDriver } from "@mikro-orm/mysql";

export default class MikroOrmInstance {
  constructor (
    private orm: MikroORM<MySqlDriver>
  ) {}

  static async init() {
    const orm = await MikroORM.init<MySqlDriver>({
      entities: ['./database/entity'],
      dbName: env.DB_NAME,
      user: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      type: env.DB_TYPE as "mysql" | "mariadb" | "postgresql" | "sqlite" | "better-sqlite",
      metadataProvider: TsMorphMetadataProvider,
      namingStrategy: UnderscoreNamingStrategy,
      pool: { max: 10, min: 2 },
      forceUtcTimezone: true,
    })

    const generator = orm.getSchemaGenerator()
    await generator.updateSchema()

    return new MikroOrmInstance(orm)
  }

  public async getOrm() {
    return this.orm
  }

  public async getEm() {
    return this.orm.em.fork()
  }

  public async open() {
    await this.orm.connect()
  }

  public async close() {
    await this.orm.close()
  }
}