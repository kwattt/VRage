import { isEqual, isMatch } from "underscore"
import { InventoryTable, VInventoryType, VItemInstance, VSubItems } from "./types"
import { ItemPool } from "./items"
import { Insertable, Updateable } from "kysely"
import { vdb } from "../../db"
import invManager from "./manager"

export class Inventory {
  id: number | undefined
  entityId: number | undefined
  items: VSubItems
  maxWeight: number
  slots: number
  type: VInventoryType
  saveTimer: NodeJS.Timeout | undefined
  /**
   * 
   * @param id - Should be undefined if the inventory is new. 
   * @param slots 
   * @param maxWeight 
   * @param type // can be part of RageEnums.EntityType or a custom type
   */
  constructor(id: number|undefined, type: VInventoryType, entityId: number, slots: number, maxWeight: number) {
    this.saveTimer = undefined
    this.id = id
    this.entityId = entityId
    this.items = {}
    this.maxWeight = maxWeight
    this.slots = Math.floor(slots)
    this.type = type

    for(let slot = 0; slot < this.slots; slot++)
      this.items[slot] = null

    Object.seal(this.items) // We don't want to add new properties to the items object.
  }

  /**
   * Check if the slot is used
   * @param slots  
   * @returns 
   */
  isSlotUsed = (slot: number) : boolean => {
    if(slot >= this.slots)
      return false
    if(!isEqual(this.items[slot], null))
      return true
    return false
  } 

  
  /**
   * Check if the inventory has space for the items, takes into account the weight and the max amount of items.
   * @param items 
   * @returns 
  */

  hasSpaceArray = (items: {hashname: string, amount: number, data?: VItemData}[]) : boolean => {
    let totalWeight = 0

    let litems = JSON.parse(JSON.stringify(items))

    for(let i = 0; i < items.length; i++){
      const itemData = ItemPool.getName(items[i].hashname)
      if(!itemData)
        return false

      totalWeight += itemData.weight * items[i].amount
    }

    if(this.getInventoryCurrentWeight() + totalWeight > this.maxWeight && this.maxWeight !== -1)
      return false

    let replacedSlots = JSON.parse(JSON.stringify(this.items))
    for(let itemSlot = 0; itemSlot < items.length; itemSlot++){

      for(let slot = 0; slot < this.slots; slot++){
        const itemData = ItemPool.getName(items[itemSlot].hashname)
        if(!itemData)
        break
        // if amount <= 0 continue
        if(litems[itemSlot].amount <= 0)
        break

        if(replacedSlots[slot] && replacedSlots[slot]?.hashname === items[itemSlot].hashname && (items[itemSlot].data ? isMatch(replacedSlots[slot]!.data, items[itemSlot].data) : 1 )){ // item existente
          // Item exists and the sum of the amount is less than the maxAmount
          if(replacedSlots[slot]!.amount + litems[itemSlot].amount <= itemData.maxAmount){
            replacedSlots[slot]!.amount += litems[itemSlot].amount
            litems[itemSlot].amount = 0
            break
          }
          // Item exists but the sum of the amount is greater than the maxAmount
          else { 
            replacedSlots[slot]!.amount = itemData.maxAmount
            litems[itemSlot].amount -= itemData.maxAmount - replacedSlots[slot]!.amount
          }
        }
        // If the slot is empty
        else if(!replacedSlots[slot]){
          if(items[itemSlot].amount <= itemData.maxAmount) { 
            replacedSlots[slot] = {
              hashname: items[itemSlot].hashname,
              amount: items[itemSlot].amount,
              data: items[itemSlot].data ? items[itemSlot].data : null
            }
            litems[itemSlot].amount = 0
            break

          } else {
            replacedSlots[slot] = {
              hashname: items[itemSlot].hashname,
              amount: itemData.maxAmount,
              data: items[itemSlot].data ? items[itemSlot].data : null
            }
            litems[itemSlot].amount -= itemData.maxAmount
          }
        }
      }
    }

    // Check if there are items left
    for(let i = 0; i < litems.length; i++){
      if(litems[i].amount > 0)
        return false
    }
    return true
  }

  /**
   * This function is to check if the inventory has space for the items, takes into account the weight and the max amount of items.
   * @param hashname hashname del item
   * @param amount cantidad del item 
   * @returns 
   */
  hasSpace = (hashname: string, amount: number, data?: VItemInstance) : boolean => {
    let leftAmount = amount
    const itemData = ItemPool.getName(hashname)
    if(!itemData){
      return false
    }

    if(this.getInventoryCurrentWeight() + amount*itemData.weight > this.maxWeight && this.maxWeight !== -1){
      return false
    }

    for(let slot = 0; slot < this.slots; slot++){
      if(this.items[slot] && this.items[slot]?.hashname === hashname && (data ? isMatch(this.items[slot]!.data, data) : 1 )){ // item existente
        if(this.items[slot]!.amount + leftAmount <= itemData.maxAmount){
          return true
        }
        else { 
          leftAmount -= itemData.maxAmount - this.items[slot]!.amount 
        }
      }
      else if(!this.items[slot]){ // no existe el slot
        if(amount <= itemData.maxAmount) { 
          return true
        } else {
          leftAmount -= itemData.maxAmount
        }
      }
    }
    if(leftAmount <= 0)
      return true

    return false
  }

  /**
   * Return the amount of items with the hashname
   * @param hashname Item hashname
   * @returns {number}
   */
  countItem = (hashname: string) : number => {
    return Object.values(this.items).reduce((cantidad, item) => {
      if (!item)
        return cantidad 
      return cantidad + (item.hashname === hashname ? item.amount : 0) 
    }, 0)
  }

  /**
   * Add/Replace an item in the inventory
   * @param slot slot que se editará para añadir el item (PUEDE SUSTITUIR)
   * @param hashname hashname del item 
   * @param amount cantidad del item
   * @param data parametros del item
   * @returns 
  */
  addItemWithIndex = (slot: number, hashname: string, amount: number, data?: VItemData) => {
    if(slot>= this.slots)
      return

      const itemData = ItemPool.getName(hashname)
      if(!itemData)
      {
        this.items[slot] = null
        return
      }

      if(itemData.sprites){
        if(!data)
          data = {}
          
        if(itemData.sprites.length > 0)
          data._sprite = itemData.sprites[Math.floor(Math.random() * itemData.sprites.length)]
        else 
          data._sprite = itemData.sprites[0]  
      }
  

      if(
        (this.items[slot] === null && this.getInventoryCurrentWeight() + amount*itemData.weight > this.maxWeight) 
        && this.maxWeight !== -1)
        return

      this.items[slot] = {
        hashname,
        amount,
        data
      }

    this.slowSave()
  }

  /**
   * Separates the item in the slot into 2 slots
   * @param slot Slot to separate
   * @param amount Amount to separate
   * @returns 
  */
  separateItem = (slot: number, amount: number) => {
    if(slot >= this.slots)
      return

    if(this.items[slot] === null)
      return

    if(this.items[slot]!.amount <= amount)
      return

    // find an empty slot
    let emptySlot = -1
    for(let i = 0; i < this.slots; i++){
      if(this.items[i] === null){
        emptySlot = i
        break
      }
    }
    if(emptySlot === -1)
      return

    // create new item to that slot
    this.items[emptySlot] = {
      hashname: this.items[slot]!.hashname,
      amount: amount,
      data: this.items[slot]!.data
    }

    // remove amount from current slot
    this.items[slot]!.amount -= amount
   
    this.slowSave()
  }

  /**
   * Add an item to the inventory
   * @param hashname Item hashname
   * @param amount Item amount
   * @param data Item data
   * @returns
  */

  addItem = (hashname: string, amount: number, data?: VItemData) => {
    let leftAmount = amount
    const itemData = ItemPool.getName(hashname)
    if(!itemData)
      return

    if(itemData.sprites){
      if(!data)
        data = {}

      if(itemData.sprites.length > 0)
        data._sprite = itemData.sprites[Math.floor(Math.random() * itemData.sprites.length)]
      else 
        data._sprite = itemData.sprites[0]
    }

    if(this.getInventoryCurrentWeight() + amount*itemData.weight > this.maxWeight && this.maxWeight !== -1)
      return

    for(let slot = 0; slot < this.slots; slot++){

      if(this.items[slot] && this.items[slot]?.hashname === hashname && (data ? isMatch(this.items[slot]!.data, data) : 1 )){ // item existente
        if(this.items[slot]!.amount + leftAmount <= itemData.maxAmount){
          // se cubre todo en este item
          this.items[slot]!.amount += leftAmount

          this.slowSave()
          return
        }
        else { 
          // no se cubre todo este item
          leftAmount -= itemData.maxAmount - this.items[slot]!.amount 
          this.items[slot]!.amount = itemData.maxAmount
        }
      }
      else if(!this.items[slot]){ // no existe el slot
        if(leftAmount <= itemData.maxAmount) { 
          // se cubre todo en el amount
          this.items[slot] = {
            hashname: hashname,
            amount: leftAmount,
            data: data ? data : null
          }

          this.slowSave()

          return 
        } else {
          // no se cubre todo aca          
          leftAmount -= itemData.maxAmount
          this.items[slot] = {
            hashname: hashname,
            amount: itemData.maxAmount,
            data: data ? data : null
          }
        }
      }
    }

    this.slowSave()
  }

  removeItem = (hashname: string, amount: number, data?: VItemData) => { 
    let to_remove = amount
    for(let slot = 0; slot < this.slots; slot++){
      if(this.items[slot]){
        if(this.items[slot]!.hashname === hashname && (data ? isMatch(this.items[slot]!.data, data) : 1 ))
        {
          if(this.items[slot]!.amount > to_remove){
            this.items[slot]!.amount -= to_remove

            this.slowSave()
            return
          }
          else {
            to_remove -= this.items[slot]!.amount
            this.items[slot] = null
          }
        }
      }
      if(to_remove <= 0){
        this.slowSave()
        return
      }
    }

    this.slowSave()
  }

  /**
   * Remove an item from the inventory
   * @param slot
   * 
   */
  removeItemWithIndex = (slot: number, amount?: number) => { // removemos item de slot
    if(slot >= this.slots)
      return 

    if(!amount){
      this.items[slot] = null
    }
    else {
      if(typeof this.items[slot] !== 'undefined'){
        this.items[slot]!.amount -= amount
        if(this.items[slot]!.amount <= 0){
          this.items[slot] = null
        }
      }
      else {
        this.items[slot] = null
      }
    }
    this.slowSave()
  }

  /**
   * Checamos si el inventario tiene un item con el hashname y data
   * @param hashname
   * @return {number}
   */
  hasItem = (hashname: string, data?: VItemData) : number => {
    for(let slot = 0; slot < this.slots; slot++){
      if(!(slot in this.items) || this.items[slot] === null)
        continue 

      if(data){
        if(this.items[slot]!.hashname === hashname)
        {
          if(isMatch(this.items[slot]!.data, data))
            return slot
        }
      }
      else if(this.items[slot]!.hashname === hashname)
        return slot
    }

    return -1
  }

  /**
   * Check if the inventory has an item with the hashname and amount
   * @param hashname
   * @param amount
   * @param data
   * @return {number}
   */
  hasItemAmount = (hashname: string, amount: number, data?: VItemData) : boolean => {
    let left = amount

    for(let slot = 0; slot < this.slots; slot++){
      if(!(slot in this.items) || this.items[slot] === null)
        continue 

      if(data){
        if(this.items[slot]!.hashname === hashname)
        {
          if(isMatch(this.items[slot]!.data, data))
            left -= this.items[slot]!.amount
        }
      }
      else if(this.items[slot]!.hashname === hashname)
        left -= this.items[slot]!.amount
    }

    if(left <= 0)
      return true
    else 
      return false
  }

  /**
   *  Returns the inventory items
   */
  getInventory = (): VSubItems => this.items

  /**
   * Returns the inventory current weight
   * @returns {number}
  */
  getInventoryCurrentWeight = () : number => {
    return Object.values(this.items).reduce((amount, item) => {
      if (!item)
        return amount 

      const itemData = ItemPool.getName(item.hashname)
      if(!itemData)
        return amount

      return amount + item.amount * itemData.weight
    }, 0)
  } 

  /**
   * Returns the inventory used slots
   * @returns {number}
  */
  getUsedSlots = () : number => {
    return Object.values(this.items).reduce((amount, item) => {
      if (!item)
        return amount 

      return amount + 1
    }, 0)
  }

  /**
   * Replace the inventory items
   * @param inventory 
   */
  setInventory = (inventory: VSubItems) => {
    const clength = Object.keys(inventory).length
    // remove items with not valid hashname
    for(let i = 0; i < clength; i++){
      if(inventory && i in inventory && (inventory[i] == null || !ItemPool.getName(inventory[i]!.hashname))){
        inventory[i] = null
     }
    }

    this.items = inventory
  }

  /**
   * Returns the amount of items with the hashname
   * @param hashname
   * @return {number}
   */
  getItemAmount = (hashname: string) : number => {
    return Object.values(this.items).reduce((amount, item) => {
      if (!item)
        return amount 
      return amount + (item.hashname === hashname ? item.amount : 0) 
    }, 0)
  }

  /**
   * Switch the items in the slots
   * @param slot1 
   * @param slot2 
   */
  switchSlots = (slot1: number, slot2: number) => {
    if(slot1 >= this.slots || slot2 >= this.slots)
      return
    
    const tmp = this.items[slot1]
    this.items[slot1] = this.items[slot2]
    this.items[slot2] = tmp

    this.slowSave()
  }

  /**
   * Obtains the item in the slot
   * @param slot 
   * @returns 
  */
  getSlot = (slot: number) : VItemInstance | null => {
    if(slot >= this.slots)
      return null
    else
      return this.items[slot] 
  }

  /**
   * Save the inventory, this property is used to save the inventory in the database
  */
  slowSave = () => {
    invManager.updateInventoryForPlayers(this)

    if(this.id !== undefined && this.saveTimer === undefined){
      this.saveTimer = setTimeout( async () => {
        await this.saveDb()
        this.saveTimer = undefined
      }, 600)
    }
  }

  /**
   * YOU MUST EXPLICITLY CALL THIS FUNCTION TO SAVE THE INVENTORY FOR THE FIRST TIME. 
   * Save the inventory in the database, if its a new inventory it will create a new entry in the database
  */
  saveDb = async () => {
    if(this.id === undefined){
      const inventoryDb : Insertable<InventoryTable> = {
        maxweight: this.maxWeight,
        slots: this.slots,
        type: this.type,
        items: JSON.stringify(Object.values(this.items))
      }
      
      await vdb.db
        .insertInto('inventory')
        .values(inventoryDb)
        .returningAll()
        .executeTakeFirstOrThrow()
  
    } else {
      const updateData : Updateable<InventoryTable> = {
        maxweight: this.maxWeight,
        slots: this.slots,
        type: this.type,
        items: JSON.stringify(Object.values(this.items))
      }

      await vdb.db
        .updateTable('inventory')
        .set(updateData)
        .where('id', '=', this.id)
        .execute()
    }
  }
}
