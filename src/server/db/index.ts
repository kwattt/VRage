import {  DataSource, EntitySchema } from "typeorm";
import { BaseEntitiesMap } from "./entities";

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

  async start() {
    if(this.type === 'none') {
      throw new Error('VRage: Database type is not defined')
    }

    this._ds = new DataSource({
      type: this.type,
      entities: this.stored_entities,
      synchronize: true,
      url: process.env.DATABASE_URL!
    })
    await this._ds.initialize()
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