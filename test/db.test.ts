// test/db.test.ts
import { Column } from 'typeorm';
import { Constructor, EntityManager, VRage } from '../src';
import * as dotenv from 'dotenv';
import { BaseEntity } from 'typeorm';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

function TestScoreMixin<TBase extends Constructor<typeof VRage.Server.DatabaseBaseEntities.BaseAccount>>(Base: TBase) {
  abstract class AccountWithScore extends Base {
    @Column({ type: 'int', default: 0 })
    score: number;
  }
  return AccountWithScore;
}

function ComplexMixin<TBase extends Constructor<typeof VRage.Server.DatabaseBaseEntities.BaseAccount>>(Base: TBase) {
  abstract class AccountComplex extends Base {
    @Column({ type: 'int', default: 0 })
    level: number;

    // level up function
    levelUp() {
      this.level++;
    }
  }
  return AccountComplex;
}

describe('default database', () => {
  beforeAll(async () => {
    VRage.Server.create('postgres');
    await VRage.Server.init();
  });

  afterAll(async () => {
    if (VRage.Server.Database) {
      await VRage.Server.Database.close();
    }
  });

  it('should create and find account', async () => {
    const Account = EntityManager.getEntity(VRage.Server.DatabaseBaseEntities.BaseAccount);

    const account = new Account();
    account.email = 'example@example.com'
    account.password = 'test123';
    account.name = 'Test User';
    await account.save();

    const found = await Account.findOne({
      where: { email: 'example@example.com' }
    });

    expect(found).toBeDefined();
    expect(found?.email).toBe('example@example.com');
  })
});

describe('Entity extension single', () => {
  beforeAll(async () => {
    // Register mixin
    EntityManager.registerMixin(VRage.Server.DatabaseBaseEntities.BaseAccount, TestScoreMixin);

    // Create and init server
    VRage.Server.create('postgres');
    await VRage.Server.init();
  });

  afterAll(async () => {
    if (VRage.Server.Database) {
      await VRage.Server.Database.close();
    }
  });

  it('should create and find account with score', async () => {
    const Account = EntityManager.getEntity(VRage.Server.DatabaseBaseEntities.BaseAccount);

    const account = new Account();
    account.email = 'test@example.com';
    account.password = 'test123';
    account.name = 'Test User';
    account.score = 100;
    await account.save();

    const found = await Account.findOne({
      where: { email: 'test@example.com' }
    });

    expect(found).toBeDefined();
    expect(found?.score).toBe(100);
    expect(found?.email).toBe('test@example.com');
  });

  it('should update account score', async () => {
    const Account = EntityManager.getEntity(VRage.Server.DatabaseBaseEntities.BaseAccount);

    const account = await Account.findOne({
      where: { email: 'test@example.com' }
    });

    if (account) {
      account.score = 150;
      await account.save();

      const updated = await Account.findOne({
        where: { email: 'test@example.com' }
      });

      expect(updated?.score).toBe(150);
    }
  });
});

describe('Entity extension multiple', () => {
  beforeAll(async () => {
    // Register mixin
    EntityManager.registerMixin(VRage.Server.DatabaseBaseEntities.BaseAccount, TestScoreMixin);
    EntityManager.registerMixin(VRage.Server.DatabaseBaseEntities.BaseAccount, ComplexMixin);

    // Create and init server
    VRage.Server.create('postgres');
    const dataSource = await VRage.Server.init();

    // Drop database and reinitialize
    if (dataSource) {
      await dataSource.getDataSource().dropDatabase();
      await dataSource.getDataSource().synchronize();
      BaseEntity.useDataSource(dataSource.getDataSource());
    }
  });

  afterAll(async () => {
    if (VRage.Server.Database) {
      await VRage.Server.Database.close();
    }
  });

  it('should create and find account with score and level', async () => {
    const Account = EntityManager.getEntity(VRage.Server.DatabaseBaseEntities.BaseAccount);

    const account = new Account();
    account.email = 'example@example.com'
    account.password = 'test123';
    account.name = 'Test User';
    account.score = 100;
    account.level = 1;
    await account.save();

    const found = await Account.findOne({
      where: { email: 'example@example.com' }
    });

    expect(found).toBeDefined();
    expect(found?.score).toBe(100);
    expect(found?.level).toBe(1);
    expect(found?.email).toBe('example@example.com');
    
    // Test level up
    found?.levelUp();
    await found?.save();

    const updated = await Account.findOne({
      where: { email: 'example@example.com' }
    });

    expect(updated?.level).toBe(2);
  })
});


declare module '../src/server/db/entities/account' {
  interface BaseAccount {
    score: number;
    level: number;
    levelUp(): void;
  }
}