import { DataBase } from './db'

export const Server: VRage.Server = {
  create: (type: 'postgres' | 'mysql' | 'none' = 'postgres') => {
    if (type !== 'none') {
      Server.Database = new DataBase(type);
    }
  },
  launch: async () => {
    if(!Server.Database) {
      throw new Error('VRage: Server was not created before launch');
    }

    await Server.Database.start();
  },
  Database: null
};
