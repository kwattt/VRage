export * from './chat'
export * from './command'
import { chatPlugin } from './chat'
import { commandPlugin } from './command'

export const baseFeatures = {
  chatPlugin,
  commandPlugin
} 