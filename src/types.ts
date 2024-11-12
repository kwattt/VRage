
export * from './shared';
export * as Server from './server';
export * as Client from './client';

declare global {
  namespace VRage {
    interface Global {
      Server: Server;
      Client: Client;
    }
  }
}

export {};