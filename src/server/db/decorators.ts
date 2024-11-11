import { getMetadataArgsStorage } from 'typeorm';
import { EntityManager } from './manager';

export function ExtendableEntity(options?: { tableName?: string }) {
  return function (target: Function) {
    // Register the entity with EntityManager
    EntityManager.registerBaseEntity(target as any);
    
    // Apply TypeORM Entity decorator if tableName is provided
    if (options?.tableName) {
      getMetadataArgsStorage().tables.push({
        target: target,
        name: options.tableName,
        type: 'regular',
        orderBy: undefined,
        engine: undefined,
      });
    }
  };
}