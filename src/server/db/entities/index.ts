import { EntitySchema } from "typeorm";
import { Account } from "./account";

export const BaseEntitiesMap: (Function | string | EntitySchema)[] = [Account];
// return full Class, not only type
export const BaseEntities = {
  Account: Account
}