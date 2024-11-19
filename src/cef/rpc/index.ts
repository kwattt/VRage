/// <reference types="@ragempcommunity/types-cef" />
export * from './../types'
export * from './types';
import { EventCallback, RPCCallback } from "./types";

class CefRPC {
  static validevents : string[] = [];
  static validRPCs : string[] = [];
  static wasInit = false;
  
  static init (){
    if(CefRPC.wasInit) return;
    CefRPC.wasInit = true;
    if(typeof mp !== 'undefined') {
      if(!mp.v) {
          // @ts-ignore
          mp.v = {};
      }
      mp.v.callServer = CefRPC.emit;
      mp.v.addServer = CefRPC.on;
      mp.v.callProcServer = CefRPC.callProc;
      mp.v.addProcServer = CefRPC.addProc;
  
      // fix procReply 
  
      //@ts-ignore
      if (window.mp.procReply) {
          // @ts-ignore
          const oldProcReply = window.mp.procReply;
          // @ts-ignore
          window.mp.procReply = (procId, data) => {
            oldProcReply.call(undefined, procId, data, null);
          };
        }
    }  
  }

  static eventWrapper(eventName: string, callback: EventCallback) {
    return () => {
      if(CefRPC.validevents.includes(eventName)) {
        callback();
      }
    }
  }

  static rpcWrapper(procName: string, callback: RPCCallback) {
    return async () => {
      if(CefRPC.validRPCs.includes(procName)) {
        return await callback();
      } 
    }
  }

  // Send event to server
  static emit(eventName: string, ...args: any[]) {
    mp.trigger('cef:toServer', 'v'+eventName, ...args);
  }

  // Register event handler for server events
  static on(eventName: string, callback: EventCallback) {
    mp.events.add('v'+eventName, CefRPC.eventWrapper(eventName, callback));
    CefRPC.validevents.push(eventName);
  }

  // Call RPC on server and get result
  static async callProc<T = any>(procName: string, ...args: any[]): Promise<T> {
    return await mp.events.callProc('cef:toServerRPC', procName, ...args);
  }

  // Register RPC handler for server calls
  static addProc(procName: string, callback: RPCCallback) {
    // @ts-ignore
    mp.events.addProc('v'+procName, CefRPC.rpcWrapper('v'+procName, callback));
    CefRPC.validRPCs.push('v'+procName);
  }
}

export { CefRPC }