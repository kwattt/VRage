export * from './basefeatures'
import { DataSourceOptions } from 'typeorm';
import { chatPlugin } from './basefeatures/chat';
import { DataBase } from './db'
import { PluginManager } from './features';
import { commandPlugin } from './basefeatures';

export class VRageServer implements VRage.Server {
  public Database: DataBase;
  public PluginManager: PluginManager;
  
  constructor(config: VRage.ServerConfig = {
    database: { type: 'postgres' },
    plugins: [chatPlugin, commandPlugin]
  }) {

    this.Database = new DataBase(config.database || { type: 'postgres' });

    this.PluginManager = new PluginManager(this.Database);
    
    if (config.plugins) {
      config.plugins.forEach(plugin => {
        this.PluginManager.registerPlugin(plugin);
      });
    }
  }

  public Core = {
    launch: async (config?: DataSourceOptions): Promise<void> => {
      if (this.Database.type !== 'none') {
        await this.Database.start(config)
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

export * from './types/index';
export * from './types/player';
export * from './types/ragemp';