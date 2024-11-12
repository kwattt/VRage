// src/index.ts

import type { ServerType } from './server/types';
import type { ClientType } from './client/types';

// Export all the modules
export * from './shared';
export * as Server from './server';
export * as Client from './client';

// Define global types for your library
declare global {
  namespace VRage {
    // Define the shape of your global types
    interface Types {
      Server: ServerType;
      Client: ClientType;
    }
  }
}


export {};