import { EntitySchema } from "typeorm";
import { createEventHandler } from "..";

export type EventName = keyof IServerEvents | (string & {});

export interface BasePlugin {
  name: string;
  version: string;
  initialize?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
  entities?: (Function | string | EntitySchema)[];
  events?: ReturnType<typeof createEventHandler>[];
}

// Allow extending the plugin with custom methods and properties
export type Plugin<T extends Record<string, any> = {}> = BasePlugin & T;

// Type helper for creating plugin methods
export type PluginMethods<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] : never;
};

// Type helper for creating plugin properties
export type PluginProperties<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K];
};

export type ExtendedPlugin<T extends Record<string, any> = {}> = Plugin<T> & {
  methods?: PluginMethods<T>;
  properties?: PluginProperties<T>;
};