import { Entity } from 'typeorm';
import { Constructor, MixinFunction } from '../types';

export class EntityManager {
  private static mixins: Map<string, MixinFunction<any>[]> = new Map();
  private static autoCreatedEntities: Map<string, any> = new Map();
  private static baseEntities: Map<string, Constructor> = new Map();

  // Method to register base entities (used by decorator)
  static registerBaseEntity(entity: Constructor) {
    this.baseEntities.set(entity.name, entity);

    // Automatically create and register the extended entity
    this.createExtendedEntity(entity.name);
  }

  private static getBaseEntity(baseEntityName: string): Constructor | undefined {
    return this.baseEntities.get(baseEntityName);
  }

  static registerMixin(baseEntity: Constructor, mixin: MixinFunction<any>) {
    const baseEntityName = baseEntity.name;
    
    // Verify the base entity is registered
    if (!this.baseEntities.has(baseEntityName)) {
      throw new Error(`Base entity ${baseEntityName} not found. Make sure to use @ExtendableEntity decorator.`);
    }
    
    const mixins = this.mixins.get(baseEntityName) || [];
    mixins.push(mixin);
    this.mixins.set(baseEntityName, mixins);
  
    // Automatically create and register the extended entity
    this.createExtendedEntity(baseEntityName);
  }

  private static createExtendedEntity(baseEntityName: string) {
    const baseEntity = this.getBaseEntity(baseEntityName);
    if (!baseEntity) return;

    // Apply all mixins
    let finalEntity = baseEntity;
    const mixins = this.mixins.get(baseEntityName) || [];
    mixins.forEach(mixin => {
      finalEntity = mixin(finalEntity);
    });

    // Create the actual entity class with proper name and decorators
    @Entity(baseEntityName.toLowerCase()) // Make sure Entity decorator is applied
    class ExtendedEntity extends finalEntity {
      // Add constructor to ensure proper inheritance
      constructor() {
        super();
      }
    }

    // Important: Set the proper name for the class
    Object.defineProperty(ExtendedEntity, 'name', { value: baseEntityName });

    // Store it
    this.autoCreatedEntities.set(baseEntityName, ExtendedEntity);
  }

  static getExtendedEntity<T extends Constructor>(baseEntity: T): T {
    const baseEntityName = baseEntity.name;
    const extendedEntity = this.autoCreatedEntities.get(baseEntityName);
    if (!extendedEntity) {
      throw new Error(`No extended entity found for ${baseEntityName}. Did you register any mixins?`);
    }
    return extendedEntity as T;
  }

  // will get the entity, if its not extended, it will return the base entity from  getBaseEntity
  static getEntity<T extends Constructor>(entity: T): T {
    const entityName = entity.name;
    return this.autoCreatedEntities.get(entityName) || this.baseEntities.get(entityName) as T;
  }

  // will get all entities, if its not extended, it will return the base entity from  getBaseEntity, use name to validate, if its not extended, return the base entity
  static getAllEntities() {
    return Array.from(this.baseEntities.values()).map(entity => this.getEntity(entity));
  }

  static getAllExtendedEntities() {
    return Array.from(this.autoCreatedEntities.values());
  }
}
