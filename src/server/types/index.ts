import { DataBase } from "../db";
import { PluginManager } from "../features";
import { Plugin } from "../features/types";

declare global {
  namespace VRage {
    interface PluginConfig extends Plugin {}

    interface ServerConfig {
      database?: {
        type: 'postgres' | 'mysql' | 'none';
        url?: string;
        // other db options
      };
      plugins?: Plugin[];
    }

    interface Server {
      Database: DataBase;
      PluginManager: PluginManager;
      Core: {
        launch: () => Promise<void>;
        shutdown: () => Promise<void>;
      };
    }
  }
}