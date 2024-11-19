import { JSONColumnType, Generated } from "kysely";
import { Inventory } from "../inventory";

export interface VDefaultItemData {
  _sprite?: string,

  [key: string]: any
} 

declare global {
  interface IServerEvents {
    'v-inv:openInventory': (player: PlayerMp, name: string, inv: Inventory, canEdit: boolean, maxDistance?: number) => void
    'v-inv:closeInventory': (inv: Inventory, slot: number) => void
  }

  interface VWeaponData extends VDefaultItemData {
    ammoType: 'pistol' | 'rifle' | 'shotgun' | 'smg' | 'sniper' | 'heavy' | 'special'
    weaponModel: number | string ,
    maxAmmo: number,
  }
  
  export type VItemData = VDefaultItemData | VWeaponData

  export interface VItem {
    hashname: string // Item identifier, must be unique
    name: string // Item name
    description?: string // Item description
    maxAmount: number // Item max stack amount
    weight: number // Item weight
    hashmodel: number | string // Item model
    sprites?: string[] // Item sprites
  
    colour?: boolean // used for identifying the item in the inventory
    price?: number // Item price

    attach?: { // Attach data for the item
      lhand?: VAttachData // Item left hand attach data 
      rhand?: VAttachData // Item right hand attach data
    }
    
    defaultData?: any
  
    category?: string[] // Item category
    actions?: {
      name: string, 
      action: ((player: PlayerMp, slotId: number, action: number, data: VItemInstance, inv: Inventory) => Promise<void>) | 
      ((player: PlayerMp, slotId: number, action: number, data: VItemInstance, inv: Inventory) => void) | 
      ((player: PlayerMp, slotId: number, action: number, data: VItemInstance, inv: Inventory) => Promise<void>)[] | 
      ((player: PlayerMp, slotId: number, action: number, data: VItemInstance, inv: Inventory) => void)[]
    }[]
  

    dropData?: {
      flip?: boolean // Flip the item when dropped
      offZ? : number // Offset Z when dropped
    }

    onDrop?: () => void // TODO
    onMove?: () => void // TODO 
  }
}

export type VAttachData = { // Data for attaching items to the player
  model: number | string,
  bone: number|string,
  pos: {x: number, y: number, z: number},
  rot: {x: number, y: number, z: number}
}

export type VItemInstance = {
  hashname: string
  amount: number
  data: VItemData
} | null

export type VInventoryType = `${keyof typeof RageEnums.EntityType}` | (string & {});

export interface InventoryTable {
  id: Generated<number>
  items: JSONColumnType<VItemInstance[]> | null
  maxweight: number
  slots: number
  type: VInventoryType
}

export type VSubItems = {
  [key: number]: VItemInstance
}

declare global {
  interface VDatabaseTables {
    inventory: InventoryTable
  }
}