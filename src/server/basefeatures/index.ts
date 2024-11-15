export * from './chat'
export * from './command'
export * from './account'

import { accountPlugin } from './account'
import { chatPlugin } from './chat'
import { commandPlugin } from './command'

export const baseFeatures = {
  chatPlugin,
  commandPlugin,
  accountPlugin
} 