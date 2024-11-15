export * from './basefeatures'
import { DB, vdb } from './db'

import { PluginManager } from './features';
import { commandPlugin, chatPlugin, accountPlugin } from './basefeatures';

export class VRageServer implements VRage.Server {
  public Database: DB;
  public PluginManager: PluginManager;
  
  constructor(config: VRage.ServerConfig = {
    database: { type: 'postgres'},
    plugins: [chatPlugin, commandPlugin, accountPlugin]
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
    return new VRageServer(config);
  }
}
