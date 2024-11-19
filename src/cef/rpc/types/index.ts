type CallServer = {
  // Typed version when ICEFEventServer is available
  <K extends keyof ICEFEventServer>(eventName: K, ...args: Parameters<ICEFEventServer[K]>): void;
  // Fallback version for any string event name
  (eventName: string, ...args: any[]): void;
};

type CallProcServer = {
  // Typed version when ICEFRPCServer is available
  <K extends keyof ICEFRPCServer>(procName: K, ...args: Parameters<ICEFRPCServer[K]>): ReturnType<ICEFRPCServer[K]>;
  // Fallback version for any string proc name
  (procName: string, ...args: any[]): Promise<any>;
};

declare global {
  interface VMp {
    callServer: CallServer;
    callProcServer: CallProcServer;

    addServer: (eventName: string, callback: EventCallback) => void;
    addProcServer: (procName: string, callback: RPCCallback) => void;
  }

  export interface ICEFEventServer {}
  export interface ICEFRPCServer {}
}

export type RPCCallback = (...args: any[]) => any;
export type EventCallback = (...args: any[]) => void;