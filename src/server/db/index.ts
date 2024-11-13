import {  DataSource, DataSourceOptions, EntitySchema } from "typeorm";
import { BaseEntitiesMap } from "./entities";

declare global {
  interface IServerEvents {
    'v-onDatabaseLoad': () => void
  }
}

export class DataBase {
  stored_entities: (Function | string | EntitySchema)[] = []
  type = 'none' as 'mysql' | 'postgres' | 'none'
  _ds: DataSource | null = null

  constructor( {
    type = 'postgres'
  } : {
    type: 'mysql' | 'postgres' | 'none'
  }
  ){ 
    if(type === 'none') {
      return
    }

    this.type = type
    this.stored_entities = BaseEntitiesMap
  }

  async start(config?: DataSourceOptions) {
    if(this.type === 'none') {
      throw new Error('VRage: Database type is not defined')
    }

    new Promise<void>(async (resolve, reject) => {
      this._ds = new DataSource(config || this.defaultDataSourceConfig)
  
      await this._ds.initialize().then(() => {
        mp.events.call('v-onDatabaseLoad')
      })
    })
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