import { DB } from './server/db';
import { EntityManager } from './server/db/manager';
import { Server } from './server';

export const VRage = {
  Client: {},
  Server: Server,
};

export { DB, EntityManager, Server };
export * from './server/types';