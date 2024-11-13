import { createEventHandler } from "..";

export type EventName = keyof IServerEvents | (string & {});

export interface BasePlugin {
  name: string;
  version: string;
  initialize?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
  events?: ReturnType<typeof createEventHandler>[];
}

export type Plugin<T extends Record<string, any> = {}> = BasePlugin & T;