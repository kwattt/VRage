import { Inventory } from "./inventory"
import { VInventoryType } from "./types"

class InventoryManager { 
  _PlayerOpenInventories: {
    [key in VInventoryType]?: {
      [key: number]: PlayerMp[]
    }
  } = {}

  getPlayersInInventory(inv: Inventory){
    if(!this._PlayerOpenInventories[inv.type]){
      return []
    }
    return this._PlayerOpenInventories[inv.type]?.[inv.entityId] || []
  }

  closeInventory(inv: Inventory){
    const players = this.getPlayersInInventory(inv)
    for(const player of players){
      let ids_to_remove = []
      for(const i in player.v._openInv){
        if(player.v._openInv[i]?.type === inv.type && player.v._openInv[i]?.id === inv.entityId){
          ids_to_remove.push(i)
        }
      }

      for(const i of ids_to_remove)
        player.v._openInv[i] = undefined

      //player.call('v-inv:closeInventory', [ids_to_remove])
    }
  }

  openInventoryForPlayer(player: PlayerMp, name: string, inv: Inventory, canEdit: boolean, maxDistance?: number) : boolean {
    if(!this._PlayerOpenInventories[inv.type]){
      this._PlayerOpenInventories[inv.type] = {}
    }

    if(!this._PlayerOpenInventories[inv.type][inv.entityId]){
      this._PlayerOpenInventories[inv.type][inv.entityId] = []
    }

    if(this.hasInventoryOpen(player, inv)){
      return false
    }

    let slot = -1
    for(let i = 0; i < player.v._openInv.length; i++){
      if(!player.v._openInv[i]){
        slot = i
        break
      }
    }

    if(slot === -1){
      return false 
    }

    this._PlayerOpenInventories[inv.type][inv.entityId].push(player)
    player.v._openInv[slot] = {name, type: inv.type, id:inv.entityId, canEdit, maxDistance}
    this.setInventoryForPlayer(player, slot, name, inv, canEdit, maxDistance)
    mp.events.call('v-inv:openInventory', player, name, inv, canEdit, maxDistance)
    return true 
  }

  setInventoryForPlayer(player: PlayerMp, slot: number, name: string, inv: Inventory, canEdit: boolean, maxDistance?: number){
    player.v._openInv[slot] = {name, type: inv.type, id:inv.entityId, canEdit, maxDistance}
  }

  closeInventoryForPlayer(player: PlayerMp, inv: Inventory){
    let slot = -1
    for(let i = 0; i < player.v._openInv.length; i++){
      if(player.v._openInv[i]?.type === inv.type && player.v._openInv[i]?.id === inv.entityId){
        slot = i
        break
      }
    }
    if (slot === -1) return

    player.v._openInv[slot] = undefined
    mp.events.call('v-inv:closeInventory', player, inv, slot)
    this._PlayerOpenInventories[inv.type][inv.entityId] = this._PlayerOpenInventories[inv.type][inv.entityId].filter(v => v !== player)
  }

  hasInventoryOpen(player: PlayerMp, inv: Inventory){
    return this.getPlayersInInventory(inv).includes(player)
  }

  updateInventoryForPlayers(inv: Inventory){
    const players = this.getPlayersInInventory(inv)
    for(const player of players){
      // first get open slot
      let slot = -1
      for(let i = 0; i < player.v._openInv.length; i++){
        if(player.v._openInv[i]?.type === inv.type && player.v._openInv[i]?.id === inv.entityId){
          slot = i
          break
        }
      }

      if(slot === -1){
        this._PlayerOpenInventories[inv.type][inv.entityId] = this._PlayerOpenInventories[inv.type][inv.entityId].filter(v => v !== player)
      } else 
        this.setInventoryForPlayer(player, slot, player.v._openInv[slot].name, inv, player.v._openInv[slot].canEdit, player.v._openInv[slot].maxDistance)
    }
  }
}

const invManager = new InventoryManager()
export default invManager