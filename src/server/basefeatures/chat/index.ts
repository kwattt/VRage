import { createEventHandler, createPlugin, PluginManager } from "src/server/features";

export const chatPlugin = createPlugin({
  name: 'chat',
  version: 'base',
  events: [
    createEventHandler('playerChat', (player, message) => {
      mp.players.broadcast(`${player.name}: ${message}`)
    }),
  ],

  initialize: () => {
    console.log('Chat plugin initialized')
  }
})