import { Kysely, MysqlDialect, PostgresDialect, sql } from "kysely"
import { Pool } from "pg"
import { createPool } from "mysql2"
declare global {
  interface IServerEvents {
    'v-onDatabaseLoad': () => void
  }

  interface VDatabaseTables {}
}

export type DB = {
  type: 'postgres' | 'mysql' | 'none',
  db: Kysely<VDatabaseTables> | null

  start({type} : {
    type: 'mysql' | 'postgres' | 'none'
  }): void

  close(): void
}

export const vdb: DB = {
  type: 'none',
  db: null,

  start({type = 'postgres'} : {
    type: 'mysql' | 'postgres' | 'none'
  }) {
    console.log('Starting database', type)
    if(type === 'none') {
      return
    }

    vdb.type = type;
    if(vdb.type === 'postgres') {
      const dialect = new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL
        })
      })

      if(!dialect) {
        throw new Error('VRage: Database connection failed')
      }
      
      vdb.db = new Kysely<VDatabaseTables>({dialect})
    } else if (vdb.type === 'mysql') {
      const dialect = new MysqlDialect({
        pool: createPool({
          uri: process.env.DATABASE_URL!
        })
      })

      if(!dialect) {
        throw new Error('VRage: Database connection failed')
      }

      vdb.db = new Kysely<VDatabaseTables>({dialect})

    }

    if(!vdb.db) {
      throw new Error('VRage: Database connection failed')
    }

    // try a connection

    sql`SELECT 1`.execute(vdb.db).then(() => {
      mp.events.call('v-onDatabaseLoad')
    })
  },

  close () {
    if(!vdb.db) {
      throw new Error('VRage: Database was not started before closing')
    }
    
    vdb.db.destroy()
  }
}

/* 
  import {  DataSource, DataSourceOptions, EntitySchema } from "typeorm";
  import { BaseEntitiesMap } from "./entities";

    async start(config?: DataSourceOptions) {
      if(this.type === 'none') {
        throw new Error('VRage: Database type is not defined')
      }
      this._ds = new DataSource(config || this.defaultDataSourceConfig)
      await this._ds.initialize()

      mp.events.call('v-onDatabaseLoad')
    }

    get defaultDataSourceConfig() {
      return {
        type: this.type,
        entities: this.stored_entities,
        url: process.env.DATABASE_URL!
      } as DataSourceOptions
    }

    async close() {
      if(!this._ds) {
        throw new Error('VRage: Database was not started before closing')
      }
      await this._ds.destroy()
    }

    registerEntity(entity: (Function | string | EntitySchema)) {
      this.stored_entities.push(entity)
    }

    get entities() {
      return this.stored_entities
    }
  }
  */