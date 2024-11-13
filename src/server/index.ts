
export * from './types/index';
export * from './types/ragemp';
export * from './types/player';

import { Account } from './db/entities/account';
import { DataBase } from './db';
export {
  Account
}
export {
  DataBase,
}

export * from './server'

mp.events.add('packagesLoaded', () => {
  console.log('V-RAGE event: Server packages loaded')
})