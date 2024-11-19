declare global {
  interface Mp {
    v: VMp;
  } 

  interface EventMpPool {
    addProc(procedureName: string, callback: (...args: any[]) => void): void;
  }

  interface VMp {}
}

export type VMp = globalThis.VMp
export {}