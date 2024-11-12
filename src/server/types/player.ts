import { Account } from "../db/entities/account"

export interface VPlayer {
  account: {
    loggedIn: boolean
    dbAccount?: Account
  }
}

export {}