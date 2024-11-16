
import '@ragempcommunity/types-server'
import type { AccountTable } from './index';

declare global {
  interface PlayerMp {
    v: {
      account: AccountTable
    }
  }
}

export {}