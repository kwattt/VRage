import { accountPlugin } from "../account";
import { chatPlugin } from "../chat";
import { commandPlugin } from "../command";
import { inventoryPlugin } from "../inventory";

const basePlugin = [
  accountPlugin,
  commandPlugin,
  inventoryPlugin,
  chatPlugin
]

export default basePlugin