import { DataBase } from './db'

export const Server: VRage.Server = {

  Database: new DataBase({
    type: 'postgres'
  }),

  Core: {
    launch: async () => {
      if(Server.Database.type !== 'none')
        await Server.Database.start()
    }
  }

};
