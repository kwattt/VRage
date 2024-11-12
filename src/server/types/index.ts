import { DataBase } from "../db";

declare global {
  namespace VRage {
    interface Server {
      Database: DataBase
      Core: {
        launch: () => Promise<void>;
      }
    }
  }
}

export type ServerType = VRage.Server;
export {}