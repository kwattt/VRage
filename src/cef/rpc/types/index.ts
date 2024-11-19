declare global {
  interface VMp {
    callServer: (eventName: string, ...args: any[]) => void;
    addServer: (eventName: string, callback: EventCallback) => void;
    callProcServer: <T = any>(procName: string, ...args: any[]) => Promise<T>;
    addProcServer: (procName: string, callback: RPCCallback) => void;
  }
}

export type RPCCallback = (...args: any[]) => any;
export type EventCallback = (...args: any[]) => void;