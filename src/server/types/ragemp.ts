
import '@ragempcommunity/types-server'
import { AccountTable } from '../basefeatures/account'

declare global {
  interface PlayerMp {
    v: {
      account: AccountTable
    }
  }
}

export {}