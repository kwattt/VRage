export class Items { 
  _items: Map<string, VItem> 
  constructor(){
    this._items = new Map()
  }

  /**
   * Add a new item to the pool
   * @param data - Item data
   * 
  */
  add = (data : VItem) => {
    const {hashname, name, description, actions, sprites} = data

    if(hashname.length < 1)
      throw new Error('You cannot add an item without a hashname or length < 1')

    if(name.length < 1)
      throw new Error(`You cannot add an item without a name or length < 1`)

    if(this._items.get(hashname.toLocaleLowerCase()))
      throw new Error(`Item with hashname ${hashname} already exists`)

    this._items.set(hashname.toLowerCase(), {
      ...data,
      sprites: sprites || [],
      description: description ? description : '',
      actions: actions ? actions : []
    })

  }

  /**
   * 
   * Check if the item exists
   * @param hashname 
   * @returns {boolean}
  */
  exists = (hashname: string) : boolean => {
    if(this._items.get(hashname))
      return true
    return false
  } 

  /**
   * Get all items names from the pool
   * @returns 
   */
  getAll = () => {
    return [...this._items.keys()]
  }

  /**
   * Get all items data from the pool
   * @returns
   * 
  */
  getAllData = () => {
    return [...this._items.values()]
  }

  // Get all items with a specific category
  getCategory = (category: string) => {
    return [...this._items.values()].filter(item => item.category?.includes(category))
  }

  /**
   * Get the item with the hashname
   * @param hashname 
   * @returns 
  */
  getName = (hashname: string) => {
    return this._items.get(hashname)
  }

  /**
   * Get the item with the 'name' property
   * @param name
   */

  getDisplayName = (name: string) => {
    return [...this._items.values()].find(item => item.name === name)
  }

}

export const ItemPool = new Items()