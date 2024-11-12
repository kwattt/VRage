import { DataBase } from "../db";

declare global {
  namespace VRage {
    interface Server {
      create: (type: 'postgres' | 'mysql' | 'none') => void;
      launch: () => Promise<void>;
      Database: DataBase | null;
    }
  }
}

export type ServerType = VRage.Server;
export {}