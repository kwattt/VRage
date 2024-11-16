/// <reference path="../../types/index.ts" />
import { createEventHandler, createPlugin } from '../../plugins';
import type { BasePlugin } from '../../plugins/types';

export function getFnParamNames(fn: Function): string[] {
    const fnStr = fn.toString();
    const arrowMatch = fnStr.match(/\(?[^]*?\)?\s*=>/);
    if (arrowMatch) return arrowMatch[0].replace(/[()\s]/gi,'').replace('=>','').split(',');
    const match = fnStr.match(/\([^]*?\)/);
    return match ? match[0].replace(/[()\s]/gi,'').split(',') : [];
}
export type ValidLanguages = 'en' | 'es';

export interface AdminPermission {
  id: string;
  name: string;
  description?: string;
}

export interface CommandCategory {
  name: string;
  description?: string;
}

export interface DescriptionWithLanguage {
  [key: string]: string;
}

export interface CommandCompletion {
  admin?: number;
  args: string[];
  desc: string | DescriptionWithLanguage;
  type: string[];
}

export interface CommandCompletionMap {
  [key: string]: Record<string, CommandCompletion>;
}

export interface Command {
  name: string;
  aliases?: string[];
  description?: string | DescriptionWithLanguage;
  category?: string[];
  admin?: number;
  adminPermissions?: string[];
  beforeRun?: (player: PlayerMp, fullText: string, ...args: string[]) => Promise<boolean> | boolean;
  run: (player: PlayerMp, fullText: string, ...args: string[]) => Promise<void> | void;
}

// Utilities
const parseCommandArgs = (message: string): string[] | null => {
  return message.match(/(?:[^\s'"]+|['"](?:\\.|[^'\\])*['"])+/g)
    ?.map(arg => {
      if ((arg.startsWith("'") && arg.endsWith("'")) || 
          (arg.startsWith('"') && arg.endsWith('"'))) {
        const stripped = arg.slice(1, -1);
        return stripped.length ? stripped : null;
      }
      return arg;
    })
    .filter((arg): arg is string => arg !== null);
};

const commandManager = new class CommandManager {
  private readonly MAX_ADMIN_LEVEL = 6;
  private readonly DEFAULT_PERMISSIONS = [
    { id: 'MANAGE_PLAYERS', name: 'Manage Players' },
    { id: 'MANAGE_BANS', name: 'Manage Bans' },
    { id: 'MANAGE_ADMINS', name: 'Manage Admins' },
    { id: 'MANAGE_PROPERTIES', name: 'Manage Properties' },
    { id: 'MANAGE_FACTIONS', name: 'Manage Factions' },
  ] as const;

  private readonly DEFAULT_CATEGORIES = [
    { id: 'ADMIN', name: 'Administration', order: 1 },
    { id: 'USER', name: 'User Commands', order: 2 },
    { id: 'VEHICLE', name: 'Vehicle Commands', order: 3 },
    { id: 'PROPERTY', name: 'Property Commands', order: 4 },
    { id: 'FACTION', name: 'Faction Commands', order: 5 },
    { id: 'CHARACTER', name: 'Character Commands', order: 6 },
    { id: 'JOB', name: 'Job Commands', order: 7 },
    { id: 'ANIMATION', name: 'Animation Commands', order: 8 },
    { id: 'OTHER', name: 'Other Commands', order: 9 },
    { id: 'HIDDEN', name: 'Hidden Commands', order: 10 },
  ] as const;

  public notFoundMessageEnabled = true;
  public notFoundMessage = '!{Red}Error: !{White}Unknown command. Use /help to see a list of available commands.';
  public invalidPermissionsMessage = '!{Red}Error: !{White}You don\'t have permission to use this command.';

  private readonly permissions = new Map<string, AdminPermission>();
  private readonly categories = new Map<string, CommandCategory>();
  private readonly commands = new Map<string, Command>();
  private readonly aliasToCommand = new Map<string, string>();
  private readonly categoryCommands = new Map<string, Set<string>>();
  private readonly commandCompletions: CommandCompletionMap = this.initializeCommandCompletions();

  constructor() {
    this.initializeDefaultPermissions();
    this.initializeDefaultCategories();
  }

  private initializeCommandCompletions(): CommandCompletionMap {
    const completions: CommandCompletionMap = {};
    
    // Initialize admin levels
    for (let i = 0; i <= this.MAX_ADMIN_LEVEL; i++) {
      completions[i.toString()] = {};
    }
    
    // Initialize permission-based completions
    this.DEFAULT_PERMISSIONS.forEach(({ id }) => {
      completions[id] = {};
    });

    return completions;
  }

  private initializeDefaultPermissions(): void {
    this.DEFAULT_PERMISSIONS.forEach(permission => {
      this.addPermission(permission);
    });
  }

  private initializeDefaultCategories(): void {
    this.DEFAULT_CATEGORIES.forEach(category => {
      this.addCategory(category);
    });
  }

  public async processCommand(player: PlayerMp, message: string): Promise<void> {
    if (!mp.players.exists(player)) return;

    const args = parseCommandArgs(message.trim());
    if (!args?.length) {
      return player.outputChatBox('Error: No command provided.');
    }

    const [commandName, ...cmdArgs] = args;
    const command = this.findCommand(commandName);

    if (!command) {
      return this.notFoundMessageEnabled && 
        player.outputChatBox(this.notFoundMessage);
    }

    if (!this.checkPermissions(player, command)) {
      return player.outputChatBox(this.invalidPermissionsMessage);
    }

    try {
      const fullText = message.substring(commandName.length + 1);
      const shouldRun = command.beforeRun ? 
        await Promise.resolve(command.beforeRun(player, fullText, ...cmdArgs)) : 
        true;

      if (shouldRun) {
        await Promise.resolve(command.run(player, fullText, ...cmdArgs));
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      player.outputChatBox(`Error executing command: ${error.message}`);
    }
  }

  private checkPermissions(player: PlayerMp, command: Command): boolean {
    if (!command.admin && !command.adminPermissions?.length) return true;
    
    const hasAdminLevel = !command.admin || 
      (player?.v?.account?.admin && player.v.account.admin >= command.admin);
      
    if(command.adminPermissions?.length > 0) {
        //for (const perm of command.adminPermissions) {
        //    if (!player?.v?.account?.permissions?.includes(perm)) {
        //    return false;
        //    }
        //}
    }

    return hasAdminLevel;
  }

  public addCommand(command: Command): void {
    this.validateCommand(command);
    
    const nameLowercase = command.name.toLowerCase();
    const fixedAliases = command.aliases? this.normalizeAliases(command.aliases) : [];

    this.commands.set(nameLowercase, {
      ...command,
      name: nameLowercase,
      aliases: fixedAliases,
      admin: command.admin ?? 0,
      category: command.category ?? [],
      description: command.description ?? '',
      adminPermissions: command.adminPermissions ?? [],
    });

    this.registerAliases(nameLowercase, fixedAliases);
    this.registerCategories(nameLowercase, command.category);
  }

  private validateCommand(command: Command): void {
    if (!command) throw new Error("No command information was passed");
    if (!command.name || typeof command.name !== "string" || !command.name.length) {
      throw new Error("Command name cannot be empty");
    }
    if (typeof command.run !== "function") throw new Error("Command must have a run function");

    // Validate categories
    command.category?.forEach(cat => {
      if (!this.categories.has(cat)) throw new Error(`Invalid category: ${cat}`);
    });

    // Validate permissions
    command.adminPermissions?.forEach(perm => {
      if (!this.permissions.has(perm)) throw new Error(`Invalid permission: ${perm}`);
    });

    const nameLowercase = command.name.toLowerCase();
    if (this.commands.has(nameLowercase) || this.aliasToCommand.has(nameLowercase)) {
      throw new Error(`Command "${nameLowercase}" already exists`);
    }
  }

  private normalizeAliases(aliases: string[] = []): string[] {
    return [...new Set(
      aliases
        .filter(alias => typeof alias === "string" && alias.length)
        .map(alias => alias.toLowerCase())
    )];
  }

  private registerAliases(commandName: string, aliases: string[]): void {
    for (const alias of aliases) {
      if (this.commands.has(alias) || this.aliasToCommand.has(alias)) {
        throw new Error(`Alias "${alias}" already exists`);
      }
      this.aliasToCommand.set(alias, commandName);
    }
  }

  private registerCategories(commandName: string, categories?: string[]): void {
    categories?.forEach(cat => {
      if (!this.categoryCommands.has(cat)) {
        this.categoryCommands.set(cat, new Set([commandName]));
      } else {
        this.categoryCommands.get(cat)!.add(commandName);
      }
    });
  }

  public generateCommandCompletions(): void {
    const commandData: Record<string, CommandCompletion> = {};

    for (const command of this.commands.values()) {
      if (command.category?.includes('HIDDEN')) continue;

      const cmdArgs = getFnParamNames(command.run)
        .slice(2)
        .filter(arg => !arg.toLowerCase().includes('exclude'));

      const names = [command.name, ...(command.aliases || [])];

      for (const name of names) {
        commandData[name] = {
          admin: command.admin || 0,
          args: cmdArgs,
          desc: command.description || '~~',
          type: command.adminPermissions || []
        };
      }
    }

    this.populateCommandCompletions(commandData);
  }

  private populateCommandCompletions(commandData: Record<string, CommandCompletion>): void {
    Object.entries(commandData).forEach(([cmdName, cmdData]) => {
      const adminLevel = cmdData.admin || 0;
      
      // Populate admin level completions
      for (let i = adminLevel; i <= this.MAX_ADMIN_LEVEL; i++) {
        if (!cmdData.type.length) {
          this.commandCompletions[i.toString()][cmdName] = cmdData;
        } else if (!adminLevel || adminLevel >= i) {
          cmdData.type.forEach(permType => {
            this.commandCompletions[permType][cmdName] = cmdData;
          });
        }
      }
    });
  }

  // Public API methods
  public getCommandCompletions(adminLevel: number | string): Record<string, CommandCompletion> {
    return this.commandCompletions[adminLevel.toString()] || {};
  }

  public removeCommand(commandName: string): boolean {
    const command = this.findCommand(commandName);
    if (!command) return false;

    command.category?.forEach(cat => {
      this.categoryCommands.get(cat)?.delete(command.name);
    });

    command.aliases?.forEach(alias => {
      this.aliasToCommand.delete(alias);
    });

    return this.commands.delete(command.name);
  }

  public findCommand(commandName: string): Command | undefined {
    if (!commandName || typeof commandName !== "string" || !commandName.length) {
      throw new Error("Command name cannot be empty");
    }

    const normalizedName = commandName.toLowerCase();
    return this.commands.get(normalizedName) || 
           this.commands.get(this.aliasToCommand.get(normalizedName) || '');
  }

  // Permission management
  public addPermission(permission: AdminPermission): void {
    if (this.permissions.has(permission.id)) {
      throw new Error(`Permission ${permission.id} already exists`);
    }
    this.permissions.set(permission.id, permission);
  }

  public removePermission(permissionId: string): boolean {
    return this.permissions.delete(permissionId);
  }

  public getPermissions(): AdminPermission[] {
    return Array.from(this.permissions.values());
  }

  // Category management
  public addCategory(category: CommandCategory): void {
    if (this.categories.has(category.name)) {
      throw new Error(`Category ${category.name} already exists`);
    }
    this.categories.set(category.name, category);
    this.categoryCommands.set(category.name, new Set());
  }

  public removeCategory(categoryId: string): boolean {
    this.categoryCommands.delete(categoryId);
    return this.categories.delete(categoryId);
  }

  public getCategories(): CommandCategory[] {
    return Array.from(this.categories.values());
  }

  public getCategory(categoryId: string): CommandCategory | undefined {
    return this.categories.get(categoryId);
  }

  public getByCategory(categoryId: string): string[] {
    return Array.from(this.categoryCommands.get(categoryId) ?? []);
  }

  // Command information
  public getNames(): string[] {
    return Array.from(this.commands.keys());
  }

  public getNamesWithAliases(): string[] {
    return [...this.commands.keys(), ...this.aliasToCommand.keys()];
  }

  public getWithDescription(): Command[] {
    return Array.from(this.commands.values())
      .filter(command => command.description !== '');
  }

  setNotFoundMessage(message: string): void {
    this.notFoundMessage = message;
  }

  setInvalidPermissionsMessage(message: string): void {
    this.invalidPermissionsMessage = message;
  }

  setNotFoundMessageEnabled(enabled: boolean): void {
    this.notFoundMessageEnabled = enabled;
  }
}

export const commandPlugin = createPlugin<
  BasePlugin & {
    addCommand: (command: Command) => void;
    removeCommand: (commandName: string) => boolean;
    findCommand: (commandName: string) => Command | undefined;
    addPermission: (permission: AdminPermission) => void;
    removePermission: (permissionId: string) => boolean;
    getPermissions: () => AdminPermission[];
    addCategory: (category: CommandCategory) => void;
    removeCategory: (categoryId: string) => boolean;
    getCategories: () => CommandCategory[];
    getCategory: (categoryId: string) => CommandCategory | undefined;
    getByCategory: (categoryId: string) => string[];
    getNames: () => string[];
    getNamesWithAliases: () => string[];
    getWithDescription: () => Command[];
    getCommandCompletions: (adminLevel: number | string) => Record<string, CommandCompletion>;
    generateCommandCompletions: () => void;

    setNotFoundMessage: (message: string) => void;
    setNotFoundMessageEnabled: (enabled: boolean) => void;
    setInvalidPermissionsMessage: (message: string) => void;
  }
>({
  name: 'vrage-commands',
  version: 'base',

  events: [
      createEventHandler('playerCommand', (player: PlayerMp, message: string) => {
        return commandManager.processCommand(player, message);
      }),
      createEventHandler('v-commandSimulate', (player: PlayerMp, message: string) => {
        return commandManager.processCommand(player, message);
      })
  ],
  
  addCommand: commandManager.addCommand.bind(commandManager),
  removeCommand: commandManager.removeCategory.bind(commandManager),
  findCommand: commandManager.findCommand.bind(commandManager),
  addPermission: commandManager.addPermission.bind(commandManager),
  removePermission: commandManager.removePermission.bind(commandManager),
  getPermissions: commandManager.getPermissions.bind(commandManager),
  addCategory: commandManager.addCategory.bind(commandManager),
  removeCategory: commandManager.removeCategory.bind(commandManager),
  getCategories: commandManager.getCategories.bind(commandManager),
  getCategory: commandManager.getCategory.bind(commandManager),
  getByCategory: commandManager.getByCategory.bind(commandManager),
  getNames: commandManager.getNames.bind(commandManager),
  getNamesWithAliases: commandManager.getNamesWithAliases.bind(commandManager),
  getWithDescription: commandManager.getWithDescription.bind(commandManager),
  getCommandCompletions: commandManager.getCommandCompletions.bind(commandManager),
  generateCommandCompletions: commandManager.generateCommandCompletions.bind(commandManager),

  setNotFoundMessage: commandManager.setNotFoundMessage.bind(commandManager),
  setNotFoundMessageEnabled: commandManager.setNotFoundMessageEnabled.bind(commandManager),
  setInvalidPermissionsMessage: commandManager.setInvalidPermissionsMessage.bind(commandManager),

  initialize() {
    setTimeout(() => {
      commandManager.generateCommandCompletions();
    }, 500);
  }
});


declare global {
  interface VPlugins {
    'vrage-commands': typeof commandPlugin;
  }
  interface IServerEvents {
    'v-commandSimulate': (player: PlayerMp, message: string) => void;
  }
}