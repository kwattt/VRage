import { createPlugin } from "../../plugins";
import { BasePlugin } from "../../plugins/types";
import { VInventoryType } from "./types";
import { Inventory } from "./inventory";
import invManager from "./manager";
import { ItemPool } from "./items";

const inventoryPlugin = createPlugin<BasePlugin & {
    manager: typeof invManager
    itemPool: typeof ItemPool
  }>
({
  name: 'vrage-inventory',
  version: '1.0.0',

  events: [
    {event: 'playerJoin', handler: (p: PlayerMp) => {p.v._openInv = [undefined, undefined]}},
    {event: 'playerQuit', handler: (p: PlayerMp) => {
      for(const openInv of p.v._openInv) {
        if(openInv){
          const inv = invManager._PlayerOpenInventories[openInv.type]
          if(inv){
            inv[openInv.id] = inv[openInv.id].filter(v => v !== p)
          }
        }
      }
    }}
  ],

  manager: invManager,
  itemPool: ItemPool
})

export type openInventory = {
  name: string,
  type: VInventoryType,
  id: number,
  canEdit: boolean
  maxDistance?: number
} | undefined

declare global {
  export interface VEntityMp {
    inventories?: {
      [key: string]: Inventory
    }

    hasInventory: (name: string) => boolean
    addInventory: (name: string, maxSlots: number, maxWeight: number) => Inventory
    getInventory: (name: string) => Inventory | undefined
    removeInventory: (name: string) => void
  }

  interface VPlayerMp {
    openInventory: (name: string, inv: Inventory, canEdit: boolean, maxDistance?: number) => boolean
    _openInv: [openInventory, openInventory] 
  }

  interface VPlugins {
    'vrage-inventory': typeof inventoryPlugin
  }
}

const entityPools = [
  mp.Player,
  mp.Vehicle,
  mp.Blip,
  mp.Checkpoint,
  mp.Colshape,
  mp.Marker,
  mp.TextLabel,
  mp.Ped,
  mp.Object
]


for(const poolObject of entityPools){
  if(!poolObject.prototype.v){
    // @ts-ignore
    poolObject.prototype.v = {}
  }

  poolObject.prototype.v.hasInventory = function(name: string){
    return this.v.inventories?.[name] !== undefined
  }

  poolObject.prototype.v.addInventory = function(name: string, maxSlots: number, maxWeight: number){
    if(this.v.inventories?.[name]){
      return this.v.inventories[name]
    }

    const inv = new Inventory(undefined, this.type, this.id, maxSlots, maxWeight)
    this.v.inventories = this.v.inventories || {}
    this.v.inventories[name] = inv
    return inv
  }

  poolObject.prototype.v.getInventory = function(name: string){
    return this.v.inventories?.[name]
  }

  poolObject.prototype.v.removeInventory = function(name: string){
    if(!this.v.inventories?.[name]){
      invManager.closeInventory(this.v.inventories?.[name])
      return
    }

    delete this.v.inventories?.[name]
  }
}

mp.Player.prototype.v.openInventory = function(name: string, inv: Inventory, canEdit: boolean, maxDistance?: number){
  return invManager.openInventoryForPlayer(this, name, inv, canEdit, maxDistance)
}

export default inventoryPlugin