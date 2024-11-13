import { createEventHandler, createPlugin } from "src/server/features";

class ChatPluginClass {
  messageHistory: string[] = [];

  formatMessage(player: any, message: string): string {
    return `${player.name}: ${message}`;
  }

  handleChat(player: any, message: string): void {
    const formattedMessage = this.formatMessage(player, message);
    this.messageHistory.push(formattedMessage);
    mp.players.broadcast(formattedMessage);
  }
}

const chatInstance = new ChatPluginClass();

export const chatPlugin = createPlugin({
  name: 'vrage-chat',
  version: 'base',
  messageHistory: chatInstance.messageHistory,
  
  events: [
    createEventHandler('playerChat', (player, message) => {
      chatInstance.handleChat(player, message);
    })
  ],
});

declare global {
  export interface Plugins {
    'vrage-chat': typeof chatPlugin
  }
}