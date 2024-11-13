import { EntitySchema } from "typeorm";
import { DataBase } from "../db";
import { EventName, BasePlugin, Plugin, ExtendedPlugin } from "./types";

export function createEventHandler<T extends EventName>(
  event: T,
  handler: T extends keyof IServerEvents 
    ? IServerEvents[T] 
    : (...args: any[]) => void | Promise<void>
) {
  return { event, handler };
}

declare global {
  export interface Plugins {}
}

export class PluginManager{
  private plugins = new Map<string, Plugin>();
  private eventHandlers = new Map<EventName, Map<Plugin, Array<ReturnType<typeof createEventHandler>>>>();
  private database: DataBase;

  constructor(database: DataBase) {
    this.database = database;
  }

  async registerPlugin(
    plugin: Plugin
  ) {
    console.log('Registering plugin', plugin.name);
    
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    // Register entities if the plugin has any
    if (plugin.entities && plugin.entities.length > 0) {
      for (const entity of plugin.entities) {
        await this.registerEntity(entity);
      }
    }

    // Bind all methods to the plugin instance
    Object.entries(plugin).forEach(([key, value]) => {
      if (typeof value === 'function') {
        (plugin as any)[key] = value.bind(plugin);
      }
    });

    this.plugins.set(plugin.name, plugin);

    if (plugin.events) {
      for (const handler of plugin.events) {
        this.registerEventHandler(plugin, handler);
      }
    }

    if (plugin.initialize) {
      await plugin.initialize();
    }
  }

  private async registerEntity(entity: Function | string | EntitySchema) {
    this.database.registerEntity(entity);
  }
  
  getPlugin<TName extends keyof Plugins>(
    name: TName
  ): Plugins[TName] {
    const plugin = this.plugins.get(name as string);
    if (!plugin) {
      throw new Error(`Plugin ${String(name)} not found`);
    }

    return plugin as Plugins[TName];
  }

  getPlugins(): Map<string, Plugin> {
    return this.plugins;
  }

  isPluginRegistered(name: string): boolean {
    return this.plugins.has(name);
  }

  private registerEventHandler(
    plugin: Plugin,
    handler: ReturnType<typeof createEventHandler>
  ): void {
    if (!this.eventHandlers.has(handler.event)) {
      this.eventHandlers.set(handler.event, new Map());
    }
    
    const eventMap = this.eventHandlers.get(handler.event)!;
    if (!eventMap.has(plugin)) {
      eventMap.set(plugin, []);
    }

    const handlers = eventMap.get(plugin)!;
    // Bind the handler to the plugin instance
    const boundHandler = {
      ...handler,
      handler: handler.handler.bind(plugin)
    };
    handlers.push(boundHandler);

    mp.events.add(handler.event, boundHandler.handler);
  }

  async unregisterEventHandler(
    plugin: Plugin,
    eventName: string,
    handler?: ReturnType<typeof createEventHandler>
  ): Promise<void> {
    const eventMap = this.eventHandlers.get(eventName);
    if (!eventMap || !eventMap.has(plugin)) return;

    const handlers = eventMap.get(plugin)!;
    
    if (handler) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        mp.events.remove(eventName, handler.handler);
      }
    } else {
      handlers.forEach(h => mp.events.remove(eventName, h.handler));
      handlers.length = 0;
    }

    if (handlers.length === 0) {
      eventMap.delete(plugin);
    }
    if (eventMap.size === 0) {
      this.eventHandlers.delete(eventName);
    }
  }

  async unloadPlugin<TName extends keyof Plugins>(
    pluginName: TName
  ): Promise<void> {
    const plugin = this.plugins.get(pluginName as string);
    if (!plugin) {
      throw new Error(`Plugin ${String(pluginName)} not found`);
    }

    if (plugin.events) {
      for (const handler of plugin.events) {
        await this.unregisterEventHandler(plugin, handler.event, handler);
      }
    }

    if (plugin.destroy) {
      await plugin.destroy();
    }

    this.plugins.delete(pluginName as string);
  }
}

export function createPlugin<T extends Record<string, any> = {}>(
  config: BasePlugin & T
): ExtendedPlugin<T> {
  const { name, version, events, initialize, destroy, ...rest } = config;
  
  // Separate methods and properties
  const methods: Record<string, Function> = {};
  const properties: Record<string, any> = {};
  
  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value === 'function') {
      methods[key] = value;
    } else {
      properties[key] = value;
    }
  });

  return {
    name,
    version: version || '1.0.0',
    events: events || [],
    initialize,
    destroy,
    methods,
    properties,
    ...rest
  } as ExtendedPlugin<T>;
}