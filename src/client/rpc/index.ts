/// <reference types="@ragempcommunity/types-client" />

class ClientRPC {
  // Initialize the bridge
  static wasInit = false;
  static init() {
      // Handle CEF -> Server events
      if(ClientRPC.wasInit) return;
        ClientRPC.wasInit = true;   

      mp.events.add('cef:toServer', (eventName: string, ...args: any[]) => {
          mp.events.callRemote('v'+eventName, ...args);
      });

      // Handle Server -> CEF events
      mp.events.add('server:toCef', (eventName: string, ...args: any[]) => {
          const browser = mp.browsers.at(0);
          browser.call('v'+eventName, ...args);
      });

      // Handle CEF -> Server RPC
      mp.events.addProc('cef:toServerRPC', async (procName: string, ...args: any[]) => {
          try {
              const result = await mp.events.callRemoteProc('v'+procName, ...args);
              return result;
          } catch (error) {
              throw error;
          }
      });

      // Handle Server -> CEF RPC
      mp.events.addProc('server:toCefRPC', async (procName: string, ...args: any[]) => {
          try {
            const browser = mp.browsers.at(0);
            const result = await browser.callProc('v'+procName, ...args);
            return result;
          } catch (error) {
              throw error;
          }
      });
  }
}

export { ClientRPC }