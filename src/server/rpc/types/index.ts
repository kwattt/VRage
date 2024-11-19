declare global {
  interface VMp {
    callCEF: (player: PlayerMp, eventName: string, ...args: any[]) => void;
    addCEF: (eventName: string, callback: EventCallback) => void;
    callProcCEF: <T = any>(player: PlayerMp, procName: string, ...args: any[]) => Promise<T>;
    addProcCEF: (procName: string, callback: RPCCallback) => void;
  }
}

export type RPCCallback = (...args: any[]) => any;
export type EventCallback = (...args: any[]) => void;