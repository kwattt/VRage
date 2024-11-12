// src/client/index.ts
export * from './types'

export const Client: VRage.Client = {
  testFunction: () => {
    // implementation
  }
};

mp.events.add('entityStreamIn', () => {
  console.log('V-RAGE event: Client packages loaded')
})