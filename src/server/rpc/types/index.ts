type CallCEF = {
  // Typed version when IServerEventCEF is available
  <K extends keyof IServerEventCEF>(player: PlayerMp, eventName: K, ...args: Parameters<IServerEventCEF[K]>): void;
  // Fallback version for any string event name
  (player: PlayerMp, eventName: string, ...args: any[]): void;
};

type CallProcCEF = {
  // Typed version when IServerRPCCEF is available
  <K extends keyof IServerRPCCEF>(player: PlayerMp, procName: K, ...args: Parameters<IServerRPCCEF[K]>): ReturnType<IServerRPCCEF[K]>;
  // Fallback version for any string proc name
  (player: PlayerMp, procName: string, ...args: any[]): Promise<any>;
};


declare global {
  interface VMp {
    callCEF: CallCEF;
    callProcCEF: CallProcCEF;

    addProcCEF: (procName: string, callback: RPCCallback) => void;
    addCEF: (eventName: string, callback: EventCallback) => void;
  }

  export interface IServerEventCEF {}
  export interface IServerRPCCEF {}
}


export type RPCCallback = (...args: any[]) => any;
export type EventCallback = (...args: any[]) => void;