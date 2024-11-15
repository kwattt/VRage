import { DB } from "../db";
import { PluginManager } from "../features";
import { Plugin } from "../features/types";

declare global {
  namespace VRage {
    interface ServerConfig {
      database?: {
        type: 'postgres' | 'mysql' | 'none';
        url?: string;
        // other db options
      };
      plugins?: Plugin[];
    }

    export interface VDatabaseTables {}
    export interface VPlugins {}

    interface Server {
      Database: DB;
      PluginManager: PluginManager;
      Core: {
        launch: (config?: {
          type: 'postgres' | 'mysql' | 'none';
        }) => Promise<void>;
        shutdown: () => Promise<void>;
      };
    }
  }
}