import { chatPlugin } from './basefeatures/chat';
import { DataBase } from './db'
import { PluginManager } from './features';

export class VRageServer implements VRage.Server {
  public Database: DataBase;
  public PluginManager: PluginManager;
  
  constructor(config: VRage.ServerConfig = {
    database: { type: 'postgres' },
    plugins: [chatPlugin]
  }) {
    this.Database = new DataBase(config.database || { type: 'none' });
    this.PluginManager = new PluginManager();
    
    if (config.plugins) {
      config.plugins.forEach(plugin => {
        this.PluginManager.registerPlugin(plugin);
      });
    }
  }

  public Core = {
    launch: async (): Promise<void> => {
      if (this.Database.type !== 'none') {
        await this.Database.start();
      }
    },

    shutdown: async (): Promise<void> => {
      if (this.Database.type !== 'none') {
        await this.Database.close();
      }
    }
  };

  static create(config?: VRage.ServerConfig): VRage.Server {
    return new VRageServer(config);
  }
}

export const BasePlugins = {
  chatPlugin
}

export * from './types/index';
export * from './types/player';
export * from './types/ragemp';