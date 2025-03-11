import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import Scheduler from "../../scheduler";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { MariaDbDriver } from "@mikro-orm/mariadb";

declare module 'fastify' {
  interface FastifyRequest {
    em: SqlEntityManager<MySqlDriver | PostgreSqlDriver | SqliteDriver | MariaDbDriver>;
    scheduler: Scheduler;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { apiKey: string; };
    user: { apiKey: string; };
  }
}