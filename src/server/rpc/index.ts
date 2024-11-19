/// <reference types="@ragempcommunity/types-server" />
export * from './../types'
export * from './types';

import { EventCallback, RPCCallback } from "./types";

class ServerRPC {
  static validevents : string[] = [];
  static validRPCs : string[] = [];
  static wasInit = false;

  static init (){
    if(ServerRPC.wasInit) return;
    ServerRPC.wasInit = true;

    if(!mp.v){
      // @ts-ignore
      mp.v = {};
    }
    mp.v.addCEF = ServerRPC.on;
    mp.v.callCEF = ServerRPC.emit;
    mp.v.addProcCEF = ServerRPC.add;
    mp.v.callProcCEF = ServerRPC.callProc;
  }

  static eventWrapper(eventName: string, callback: EventCallback) {
    return () => {
      if(ServerRPC.validevents.includes(eventName)) {
        callback();
      }
    }
  }

  static rpcWrapper(procName: string, callback: RPCCallback) {
    return async () => {
      if(ServerRPC.validRPCs.includes(procName)) {
        return await callback();
      }
    }
  }

  static emit(player: PlayerMp, eventName: string, ...args: any[]) {
    player.call('server:toCef', [eventName, ...args]);
  }

  // Register event handler for CEF events
  static on(eventName: string, callback: EventCallback) {
    mp.events.add('v'+eventName, ServerRPC.eventWrapper(eventName, callback));
    ServerRPC.validevents.push('v'+eventName);
  }

  // Call RPC on CEF and get result
  static async callProc<T = any>(player: PlayerMp, procName: string, ...args: any[]): Promise<T> {
    return await player.callProc('server:toCefRPC', [procName, ...args]);
  }

  // Register RPC handler for CEF calls
  static add(procName: string, callback: RPCCallback) {
    mp.events.addProc(procName, ServerRPC.rpcWrapper('v'+procName, callback));
    ServerRPC.validRPCs.push('v'+procName);
  }
}

export { ServerRPC }