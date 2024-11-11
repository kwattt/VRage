import "reflect-metadata";

import { DataSource } from "typeorm";
import { EntityManager } from "./manager";

export class DB {
  private dataSource: DataSource;
  private type: 'postgres' | 'mysql';

  constructor(type: 'postgres' | 'mysql') {
    this.type = type;
  }

  getDataSource() {
    return this.dataSource;
  }

  init = async () => {
    const all_entities = EntityManager.getAllEntities();

    this.dataSource = new DataSource({
      url: process.env.DATABASE_URL,
      type: this.type,
      entities: all_entities,
      synchronize: true,
    });

    const connection = await this.dataSource.initialize();
    return connection;
  }

  close = async () => {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
