import '@ragempcommunity/types-server';

// Just define mp globally before any imports
(global as any).mp = {};


import {Account, Server} from '../dist/server'

import dotenv from 'dotenv'
import { BaseEntity, Column, Entity, 
        JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
dotenv.config()

describe('Database simple', function() {
  afterAll(async () => {
    if(Server.Database) {
      await Server.Database.close()
    }
  })

  it('should start the database', async function() {
    await Server.Core.launch()
    expect(Server.Database).toBeDefined()

    console.log('Dropping database for tests')
    await Server.Database._ds.dropDatabase()
    await Server.Database._ds.synchronize()

    // account table should exist in the database
    const account_table = await Server.Database._ds.query('SELECT * FROM account')
    expect(account_table).toBeDefined()
  })


  it('should create a new account', async function() {
    const acc = new Account()

    acc.name = 'test'
    acc.password = 'test'
    acc.admin = 0
    acc.password = 'changeme'

    await acc.save()
    
    expect(acc.id).toBeDefined()
  })
})

describe('Database custom entities', function() {
  afterAll(async () => {
    if(Server.Database) {
      await Server.Database.close()
    }
  })

  it('should push a new entity', async function() {
    
    @Entity()
    class PatitoFromPlayer extends BaseEntity {
      @PrimaryGeneratedColumn()
      id: number

      @Column()
      name: string = ''

      @Column()
      colour: string = ''

      // account 

      @OneToOne(() => Account, {
        nullable: true
      })
      @JoinColumn()
      account?: Account
    }

    Server.Database.registerEntity(PatitoFromPlayer)

    console.log('Launching database')
    await Server.Core.launch()
    expect(Server.Database).toBeDefined()
    await Server.Database._ds.dropDatabase()
    await Server.Database._ds.synchronize()
    console.log('Drop and sync done')

    const patito = new PatitoFromPlayer()
    patito.name = 'patito'
    patito.colour = 'yellow'
    await patito.save()

    expect(patito.id).toBeDefined()

    // new patito with account

    const acc = new Account()
    acc.name = 'patitomaster'
    acc.password = 'test'
    acc.admin = 0
    await acc.save()

    const other_patito = new PatitoFromPlayer()
    other_patito.name = 'gran patito'
    other_patito.colour = 'blue'
    other_patito.account = acc
    await other_patito.save() 
    
    expect(other_patito.id).toBeDefined()
    
    const patitos = await PatitoFromPlayer.find()
    expect(patitos.length).toBe(2)

    const patito_with_account = await PatitoFromPlayer.findOne({
      where: {
        account: {
          id: acc.id
        }
      },
      relations: ['account']
    })
    
    expect(patito_with_account).toBeDefined()
    expect(patito_with_account?.account).toBeDefined()
  })
})