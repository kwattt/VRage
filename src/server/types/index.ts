// src/server/types/index.ts
export * from './ragemp';
export * from '../plugins/types';
export * from '../baseplugins/account/types';

import { DB } from "../db";
import { PluginManager } from "../plugins";
import type { Plugin } from "../plugins/types";

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

    interface VDatabaseTables {}
    interface VPlugins {}

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

// Export type aliases
export type ServerConfig = VRage.ServerConfig;
export type Server = VRage.Server;
export type VDatabaseTables = VRage.VDatabaseTables;
export type VPlugins = VRage.VPlugins;