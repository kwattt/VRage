declare global {
  namespace VRage {
    interface Client {
      testFunction: () => void;
    }    
  }
}

export type ClientType = VRage.Client;
export {}