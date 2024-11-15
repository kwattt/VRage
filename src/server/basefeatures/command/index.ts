import { createEventHandler, createPlugin } from "src/server/features";
import { getFnParamNames } from "./utils";

export interface AdminPermission {
  id: string;
  name: string;
  description?: string;
}

export interface CommandCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
}

export type ValidLanguages = 'en' | 'es';

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
  [key: string]: {
      [commandName: string]: CommandCompletion;
  };
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


// src/server/basefeatures/commands/manager.ts
class CommandManager {
  notFoundMessageEnabled: boolean = true;
  permissions: Map<string, AdminPermission> = new Map();
  categories: Map<string, CommandCategory> = new Map();
  
  notFoundMessage: string = '!{Red}Error: !{White}Unknown command. Use /help to see a list of available commands.';

  private _commands: Map<string, Command> = new Map();
  private _aliasToCommand: Map<string, string> = new Map();
  private _categoryCommands: Map<string, Set<string>> = new Map();

  private commandCompletions: CommandCompletionMap = {
    '0': {}, '1': {}, '2': {}, '3': {}, '4': {}, '5': {}, '6': {},
    
    'MANAGE_PLAYERS': {}, 'MANAGE_BANS': {}, 'MANAGE_ADMINS': {}, 'MANAGE_PROPERTIES': {}, 'MANAGE_FACTIONS': {},
  };


  async processCommand(player: PlayerMp, message: string): Promise<void> {
    if (!mp.players.exists(player)) return;

    message = message.trim();
    
    // Split args, preserving quoted strings
    const args = message.match(/(?:[^\s'"]+|['"](?:\\.|[^'\\])*['"])+/g)
        ?.map(arg => {
            if ((arg.startsWith("'") && arg.endsWith("'")) || 
                (arg.startsWith('"') && arg.endsWith('"'))) {
                const stripped = arg.slice(1, -1);
                return stripped.length ? stripped : null;
            }
            return arg;
        })
        .filter((arg): arg is string => arg !== null);

    if (!args?.length) {
        return player.outputChatBox(`Error: No command provided.`);
    }

    const commandName = args.shift()!;
    const command = this.find(commandName);

    if (!command && this.notFoundMessageEnabled) {
        return player.outputChatBox(`${this.notFoundMessageEnabled}`);
    }

    const fullText = message.substring(commandName.length + 1);

    // Check permissions
    if (!this.checkPermissions(player, command)) {
        return player.outputChatBox(`Error: You don't have permission to use this command.`);
    }

  try {
    let shouldRun = true;

    // Handle beforeRun
    if (command.beforeRun) {
        shouldRun = await Promise.resolve(command.beforeRun(player, fullText, ...args));
    }

    // Handle run
    if (shouldRun === true) {
        await Promise.resolve(command.run(player, fullText, ...args));
    }
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        player.outputChatBox(`Error executing command: ${error.message}`);
    }
  }
  
  async simulateCommand(player: PlayerMp, message: string): Promise<void> {
    this.processCommand(player, message);
  }

  private checkPermissions(player: PlayerMp, command: Command): boolean {
    if (!command.admin && !command.adminPermissions?.length) return true;
    
    // Check admin level
    if (command.admin && (!player?.v?.account?.admin || player?.v?.account?.admin < command.admin)) {
        return false;
    }

    // Check specific permissions (you'll need to implement this based on your needs)
    if (command.adminPermissions?.length) {
        // Implement permission checking logic here
    }

    return true;
  }

  generateCommandCompletions(): void {
    const commandData: { [key: string]: CommandCompletion } = {};

    for (const command of this._commands.values()) {
        if (command.category?.includes('HIDDEN')) continue;

        const cmdArgs = getFnParamNames(command.run).slice(2)
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

    // Populate completions for different admin levels
    const MAX_ADMIN = 6;
    for (const [cmdName, cmdData] of Object.entries(commandData)) {
        for (let i = cmdData.admin || 0; i <= MAX_ADMIN; i++) {
            if (!cmdData.type.length) {
                this.commandCompletions[i.toString()][cmdName] = cmdData;
            } else {
                if (!cmdData.admin || cmdData.admin === 0) {
                    for (const permType of cmdData.type) {
                        this.commandCompletions[permType][cmdName] = cmdData;
                    }
                } else if (cmdData.admin >= i) {
                    for (const permType of cmdData.type) {
                        this.commandCompletions[permType][cmdName] = cmdData;
                    }
                }
            }
        }
    }
  }

  getCommandCompletions(adminLevel: number | string): { [key: string]: CommandCompletion } {
    return this.commandCompletions[adminLevel.toString()] || {};
  }


  // Add default permissions
  constructor() {
      // Add some default admin permissions
      this.addPermission({ id: 'MANAGE_PLAYERS', name: 'Manage Players' });
      this.addPermission({ id: 'MANAGE_BANS', name: 'Manage Bans' });
      this.addPermission({ id: 'MANAGE_ADMINS', name: 'Manage Admins' });
      this.addPermission({ id: 'MANAGE_PROPERTIES', name: 'Manage Properties' });
      this.addPermission({ id: 'MANAGE_FACTIONS', name: 'Manage Factions' });
      
      // Add default categories
      this.addCategory({ id: 'ADMIN', name: 'Administration', order: 1 });
      this.addCategory({ id: 'USER', name: 'User Commands', order: 2 });
      this.addCategory({ id: 'VEHICLE', name: 'Vehicle Commands', order: 3 });
      this.addCategory({ id: 'PROPERTY', name: 'Property Commands', order: 4 });
      this.addCategory({ id: 'FACTION', name: 'Faction Commands', order: 5 });
      this.addCategory({ id: 'CHARACTER', name: 'Character Commands', order: 6 });
      this.addCategory({ id: 'JOB', name: 'Job Commands', order: 7 });
      this.addCategory({ id: 'ANIMATION', name: 'Animation Commands', order: 8 });
      this.addCategory({ id: 'OTHER', name: 'Other Commands', order: 9 });
      this.addCategory({ id: 'HIDDEN', name: 'Hidden Commands', order: 10 });
  }

  add(command: Command): void {
    if (!command) {
        throw new Error("No command information was passed");
    }

    const { admin, name, category, aliases = [], beforeRun, description, run, adminPermissions } = command;

    if (!name || typeof name !== "string" || name.length === 0) {
        throw new Error("Command name cannot be empty");
    } else if (!aliases || !Array.isArray(aliases)) {
        throw new Error("Aliases must be an array");
    } else if (typeof run !== "function") {
        throw new Error("Command must have a run function");
    }

    // Validate categories
    if (category) {
        for (const cat of category) {
            if (!this.categories.has(cat)) {
                throw new Error(`Invalid category: ${cat}`);
            }
        }
    }

    // Validate permissions
    if (adminPermissions) {
        for (const perm of adminPermissions) {
            if (!this.permissions.has(perm)) {
                throw new Error(`Invalid permission: ${perm}`);
            }
        }
    }

    const nameLowercase = name.toLowerCase();
    if (this._commands.has(nameLowercase) || this._aliasToCommand.has(nameLowercase)) {
        throw new Error(`Command "${nameLowercase}" already exists`);
    }

    const fixedAliases = aliases
        .filter(alias => typeof alias === "string" && alias.length !== 0)
        .map(alias => alias.toLowerCase());

    this._commands.set(nameLowercase, {
        name: nameLowercase,
        aliases: fixedAliases,
        admin: admin ?? 0,
        category: category ?? [],
        description: description ?? '',
        adminPermissions: adminPermissions ?? [],
        beforeRun,
        run
    });

    // Register aliases
    for (const alias of new Set(fixedAliases)) {
      if (this._commands.has(alias) || this._aliasToCommand.has(alias)) {
        throw new Error(`Alias "${alias}" already exists`);
      }
      this._aliasToCommand.set(alias, nameLowercase);
    }

    // Register categories
    if (category?.length) {
      for (const cat of category) {
        if (!this._categoryCommands.has(cat)) {
          this._categoryCommands.set(cat, new Set([name]));
        } else {
          this._categoryCommands.get(cat)!.add(name);
        }
      }
    }
  }

  remove(commandName: string): boolean {
      const command = this.find(commandName);
      if (!command) return false;

      // Remove from categories
      if (command.category) {
          for (const cat of command.category) {
              this._categoryCommands.get(cat)?.delete(command.name);
          }
      }

      // Remove aliases
      command.aliases?.forEach(alias => {
          this._aliasToCommand.delete(alias);
      });

      // Remove command
      return this._commands.delete(command.name);
  }

  addPermission(permission: AdminPermission): void {
      if (this.permissions.has(permission.id)) {
          throw new Error(`Permission ${permission.id} already exists`);
      }
      this.permissions.set(permission.id, permission);
  }

  removePermission(permissionId: string): boolean {
      return this.permissions.delete(permissionId);
  }

  getPermissions(): AdminPermission[] {
      return Array.from(this.permissions.values());
  }

  addCategory(category: CommandCategory): void {
      if (this.categories.has(category.id)) {
          throw new Error(`Category ${category.id} already exists`);
      }
      this.categories.set(category.id, category);
      this._categoryCommands.set(category.id, new Set());
  }

  removeCategory(categoryId: string): boolean {
      this._categoryCommands.delete(categoryId);
      return this.categories.delete(categoryId);
  }

  getNames(): string[] {
      return Array.from(this._commands.keys());
  }

  getCategories(): CommandCategory[] {
      return Array.from(this.categories.values())
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  getCategory(categoryId: string): CommandCategory | undefined {
    return this.categories.get(categoryId);
  }

  getByCategory(categoryId: string): string[] {
      return Array.from(this._categoryCommands.get(categoryId) ?? []);
  }

  getNamesWithAliases(): string[] {
      return [...this._commands.keys(), ...this._aliasToCommand.keys()];
  }

  getWithDescription(): Command[] {
      return Array.from(this._commands.values())
          .filter(command => command.description !== '');
  }

  find(commandName: string): Command | undefined {
      if (!commandName || typeof commandName !== "string" || commandName.length === 0) {
          throw new Error("Command name cannot be empty");
      }

      commandName = commandName.toLowerCase();

      // Try to find by name
      const command = this._commands.get(commandName);
      if (command) return command;

      // Try to find by alias
      const aliasCommand = this._aliasToCommand.get(commandName);
      return this._commands.get(aliasCommand);
  }
}

const commandManager = new CommandManager();

export interface CommandPlugin {
  name: string;
  version: string;
  events: ReturnType<typeof createEventHandler>[];
  add: CommandManager['add'];
  remove: CommandManager['remove'];
  find: CommandManager['find'];
  getNames: CommandManager['getNames'];
  getCategories: CommandManager['getCategories'];
  getByCategory: CommandManager['getByCategory'];
  getNamesWithAliases: CommandManager['getNamesWithAliases'];
  getWithDescription: CommandManager['getWithDescription'];
  addPermission: CommandManager['addPermission'];
  removePermission: CommandManager['removePermission'];
  getPermissions: CommandManager['getPermissions'];
  addCategory: CommandManager['addCategory'];
  getCategory: CommandManager['getCategory'];
  removeCategory: CommandManager['removeCategory'];
  initialize: () => void;
}

export const commandPlugin = createPlugin<CommandPlugin>({
  name: 'vrage-commands',
  version: 'base',

  events: [
      createEventHandler('playerCommand', (player: PlayerMp, message: string) => {
          return commandManager.processCommand(player, message);
      }),
      createEventHandler('v-commandSimulate', (player: PlayerMp, message: string) => {
          return commandManager.simulateCommand(player, message);
      })
  ],
  
  // Explicitly type all methods
  add: commandManager.add.bind(commandManager),
  remove: commandManager.remove.bind(commandManager),
  find: commandManager.find.bind(commandManager),
  getNames: commandManager.getNames.bind(commandManager),
  getCategories: commandManager.getCategories.bind(commandManager),
  getByCategory: commandManager.getByCategory.bind(commandManager),
  getNamesWithAliases: commandManager.getNamesWithAliases.bind(commandManager),
  getWithDescription: commandManager.getWithDescription.bind(commandManager),
  addPermission: commandManager.addPermission.bind(commandManager),
  removePermission: commandManager.removePermission.bind(commandManager),
  getPermissions: commandManager.getPermissions.bind(commandManager),
  addCategory: commandManager.addCategory.bind(commandManager),
  getCategory: commandManager.getCategory.bind(commandManager),
  removeCategory: commandManager.removeCategory.bind(commandManager),

  initialize() {
      this.add({
          name: 'help',
          description: 'Shows a list of available commands',
          run(player, command) {
              if (!command) {
                  const commands = commandManager.getWithDescription();
                  const message = commands.map(cmd => `/${cmd.name} - ${cmd.description}`).join('\n');
                  player.outputChatBox(message);
              } else {
                  const cmd = commandManager.find(command);
                  if (!cmd) {
                      player.outputChatBox(`Error: Unknown command "${command}"`);
                  } else {
                      player.outputChatBox(`/${cmd.name} - ${cmd.description}`);
                  }
              }
          }
      });

      this.add({
          name: 'commands',
          description: 'Shows a list of available commands by category',
          run(player, fullText, category) {
              const commands = commandManager.getByCategory(category);
              const message = commands.map(cmd => `/${cmd}`).join('\n');
              player.outputChatBox(message);
          }
      });

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