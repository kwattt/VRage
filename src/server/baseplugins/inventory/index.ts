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
    {event: 'playerJoin', handler: (p: PlayerMp) => 
      { 
        if(!p.v)
          // @ts-ignore
          p.v = {}

        p.v.inv = new InvClass()
        p.v._openInv = [undefined, undefined]
        p.v.openInventory = function (name: string, inv: Inventory, canEdit: boolean, maxDistance?: number): boolean {
          return inventoryPlugin.manager.openInventoryForPlayer(this, name, inv, canEdit, maxDistance);
        }.bind(p)
        p.v.closeInventory = function (inv: Inventory) {
          inventoryPlugin.manager.closeInventoryForPlayer(p, inv);
        }.bind(p)
        p.v.hasInventoryOpen = function (inv: Inventory) {
          return inventoryPlugin.manager.hasInventoryOpen(p, inv);
        }.bind(p)
      }
    },
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
  interface VPlayerMp {
    inv: InvClass
    openInventory: (name: string, inv: Inventory, canEdit: boolean, maxDistance?: number) => boolean
    closeInventory: (inv: Inventory) => void
    hasInventoryOpen: (inv: Inventory) => boolean
    _openInv: [openInventory, openInventory] 
  }

  interface VVehicleMp {
    inv: InvClass
  }
  interface VCheckpointMp {
    inv: InvClass
  }
  interface VMarkerMp {
    inv: InvClass
  }
  interface VLabelMp {
    inv: InvClass
  }
  interface VPedMp {
    inv: InvClass
  }
  interface VObjectMp {
    inv: InvClass
  }

  interface VPlugins {
    'vrage-inventory': typeof inventoryPlugin
  }
}

const stuffWithNewPools = [
  mp.vehicles,
  mp.checkpoints,
  mp.markers,
  mp.labels,
  mp.peds,
  mp.objects
]

for (const pool of stuffWithNewPools) {
  const _oldmethod = pool.new;

  pool.new = function (this: any, ...args: any[]) {
      const obj = _oldmethod.apply(this, args);
      if (!obj.v) {
          obj.v = {};
      }

      if (!obj.v.inv) {
          obj.v.inv = new InvClass();
      }

      return obj;
  } as typeof _oldmethod;
}

export class InvClass {
  inventories: Record<string, Inventory>;

  constructor() {
      this.inventories = {};
  }

  hasInventory(name: string): boolean {
      return this.inventories[name] !== undefined;
  }

  addInventory(name: string, maxSlots: number, maxWeight: number): Inventory {
      if (this.inventories[name]) {
          return this.inventories[name];
      }

      const inv = new Inventory(undefined, undefined, undefined, maxSlots, maxWeight);
      this.inventories[name] = inv;
      return inv;
  }

  getInventory(name: string): Inventory | undefined {
      return this.inventories[name];
  }

  removeInventory(name: string): void {
      if (this.inventories[name]) {
          invManager.closeInventory(this.inventories[name]);
          delete this.inventories[name];
      }
  }
}

export default inventoryPlugin