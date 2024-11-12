
import '@ragempcommunity/types-server'
import { VPlayer } from "./player"

declare global {
  interface PlayerMp {
    v: VPlayer
  }
}

export {}