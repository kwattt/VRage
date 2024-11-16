// src/server/index.ts
import { DB, vdb } from './db'
import { PluginManager } from './plugins';
export * from './types';

// Export the class as 'Server' for better naming
export class Server implements VRage.Server {
  public Database: DB;
  public PluginManager: PluginManager;
  
  constructor(config: VRage.ServerConfig = {
    database: { type: 'postgres'},
    plugins: []
  }) {
    this.Database = vdb;
    this.PluginManager = new PluginManager();
    
    if (config.plugins) {
      config.plugins.forEach(plugin => {
        this.PluginManager.registerPlugin(plugin);
      });
    }
  }

  public Core = {
    launch: async (config?: {
      type: 'postgres' | 'mysql' | 'none',
    }): Promise<void> => {
      this.Database.start(config ? config : { type: 'postgres' });
    },

    shutdown: async (): Promise<void> => {
      if (this.Database.type !== 'none') {
        this.Database.close();
      }
    }
  };

  static create(config?: VRage.ServerConfig): VRage.Server {
    return new Server(config);
  }
}

export {createPlugin} from './plugins';