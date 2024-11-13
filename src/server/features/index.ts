import { EventName, BasePlugin, Plugin } from "./types";

export function createEventHandler<T extends EventName>(
  event: T,
  handler: T extends keyof IServerEvents 
    ? IServerEvents[T] 
    : (...args: any[]) => void | Promise<void>
) {
  return { event, handler };
}

export class PluginManager<TPluginMap extends Record<string, Plugin> = {}> {
  private plugins = new Map<string, Plugin>();
  private eventHandlers = new Map<EventName, Map<Plugin, Array<ReturnType<typeof createEventHandler>>>>();

  async registerPlugin<
    TName extends string,
    TPlugin extends Plugin
  >(
    plugin: TPlugin & { name: TName }
  ): Promise<PluginManager<TPluginMap & Record<TName, TPlugin>>> {
    console.log('Registering plugin', plugin.name);
    
    if (this.plugins.has(plugin.name)) {
      console.log('Plugin map state:', this.plugins);
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    this.plugins.set(plugin.name, plugin);

    if (plugin.events) {
      for (const handler of plugin.events) {
        this.registerEventHandler(plugin, handler);
      }
    }

    if (plugin.initialize) {
      await plugin.initialize();
    }

    return this as unknown as PluginManager<TPluginMap & Record<TName, TPlugin>>;
  }

  getPlugin<TName extends keyof TPluginMap>(
    name: TName
  ): TPluginMap[TName] {
    const plugin = this.plugins.get(name as string);
    if (!plugin) {
      throw new Error(`Plugin ${String(name)} not found`);
    }
    return plugin as TPluginMap[TName];
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
    handlers.push(handler);

    mp.events.add(handler.event, handler.handler);
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

  async unloadPlugin<TName extends keyof TPluginMap>(
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

export function createPlugin<T extends Record<string, any>>(
  config: {
    name: string;
    version?: string;
    events?: ReturnType<typeof createEventHandler>[];
    initialize?: () => Promise<void> | void;
    destroy?: () => Promise<void> | void;
  } & T
): Plugin<T> {
  return {
    name: config.name,
    version: config.version || '1.0.0',
    events: config.events || [],
    initialize: config.initialize,
    destroy: config.destroy,
    ...config
  };
}
