import { PluginManager } from './plugins';

// src/client/index.ts
export * from './types'

export class Client implements VRage.Client {
  public PluginManager: PluginManager;
  
  constructor(config: VRage.ClientConfig = {
    plugins: []
  }) {
    this.PluginManager = new PluginManager();
    
    if (config.plugins) {
      config.plugins.forEach(plugin => {
        this.PluginManager.registerPlugin(plugin);
      });
    }
  }


  static create(config?: VRage.ClientConfig) {
    return new Client(config);
  }
}

export {createPlugin} from './plugins';