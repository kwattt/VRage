export * from './ragemp';

import { PluginManager } from "../plugins";
import type { Plugin } from "../plugins/types";

declare global {
  namespace VRage {

    interface ClientConfig {
      plugins?: Plugin[]
    }

    interface VPlugins {}

    interface Client {
      PluginManager: PluginManager
    }    
  }
}

export type Client = VRage.Client;
export type ClientConfig = VRage.ClientConfig;