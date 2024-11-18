import { vdb } from './db';
import { PluginManager } from './plugins';
export * from './types';
let _server: VRage.Server;

const Server = {
  _init(config: VRage.ServerConfig = {
    database: { type: 'postgres' },
    plugins: []
  }): VRage.Server {
    const instance: VRage.Server = {
      Database: vdb,
      PluginManager: new PluginManager(),
      
      Core: {
        launch: async (dbConfig?: {
          type: 'postgres' | 'mysql' | 'none',
        }): Promise<void> => {
          instance.Database.start(dbConfig ? dbConfig : { type: 'postgres' });
        },

        shutdown: async (): Promise<void> => {
          if (instance.Database.type !== 'none') {
            instance.Database.close();
          }
        }
      }
    };

    if (config.plugins) {
      config.plugins.forEach(plugin => {
        instance.PluginManager.registerPlugin(plugin);
      });
    }

    return instance;
  },

  getInstance(config?: VRage.ServerConfig): VRage.Server {
    if (!_server) {
      _server = Server._init(config);
    }
    return _server;
  },

  configure(config?: VRage.ServerConfig): VRage.Server {
    _server = Server._init(config);
    return _server;
  },

  reset(): void {
    _server = null;
  }
};

mp.events.add('playerReady', (p: PlayerMp) => {
  p.type
})

export { _server as VRage, Server };
export { createPlugin } from './plugins';