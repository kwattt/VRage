import { accountPlugin } from './account'
import { chatPlugin } from './chat'
import { commandPlugin } from './command'

export {
  accountPlugin,
  chatPlugin,
  commandPlugin
}

export const defaultPlugins = [
  chatPlugin,
  commandPlugin,
  accountPlugin
]