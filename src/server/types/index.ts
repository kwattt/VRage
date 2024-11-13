import { DataSourceOptions } from "typeorm";
import { DataBase } from "../db";
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

    export interface Plugins {}

    interface Server {
      Database: DataBase;
      PluginManager: PluginManager;
      Core: {
        launch: (config?: DataSourceOptions) => Promise<void>;
        shutdown: () => Promise<void>;
      };
    }
  }
}