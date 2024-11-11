import { EntitySchema } from "typeorm";

export type Constructor<T = {}> = new (...args: any[]) => T;
export type MixinFunction<T extends Constructor> = (Base: T) => T;
export type EntityType = string | Function | EntitySchema<any>;