import { DB } from './db';
import { baseEntitiesMap } from './db/entities';

let datasource: DB | null = null;

export const Server = {
  create: (type: 'postgres' | 'mysql' | 'none' = 'postgres') => {
    if (type !== 'none') {
      // Initialize the DB connection
      datasource = new DB(type);
    }
  },

  async init() {
    if (datasource) {
      try {
        await datasource.init();
        return datasource;  // Return the initialized datasource
      } catch (error: unknown | Error) {
        console.error(error);
        throw new Error('Failed to initialize database: ' + error);
      }
    } else {
      throw new Error('Database is not initialized');
    }
  },

  get Database() {
    return datasource;
  },

  get DatabaseBaseEntities() {
    return baseEntitiesMap;
  },
};

// export types

export * from './types';

// export EntityManager
export { EntityManager } from './db/manager';

export const VRage = {
  Client: {},
  Server
};
