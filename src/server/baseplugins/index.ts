import { accountPlugin } from './account'
import { chatPlugin } from './chat'
import { commandPlugin } from './command'
import inventoryPlugin from './inventory'
export {
  accountPlugin,
  chatPlugin,
  commandPlugin,
  inventoryPlugin
}

export const defaultPlugins = [
  chatPlugin,
  commandPlugin,
  accountPlugin
]