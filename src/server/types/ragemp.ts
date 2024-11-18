
import '@ragempcommunity/types-server'
import type { AccountTable } from './index';

declare global {
  interface PlayerMp {
    v: VPlayerMp
  }

  interface EntityMp {
    v: VEntityMp
  }
  
  export interface VPlayerMp extends VEntityMp 
  {
    account?: AccountTable
  }

  export interface VEntityMp {
  }
}