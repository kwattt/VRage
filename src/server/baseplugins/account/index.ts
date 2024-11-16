import { Updateable } from "kysely"
import { AccountTable } from "./types"
import { BasePlugin } from "../../plugins/types";
import { createPlugin } from "../../plugins";
import { vdb } from "../../db";

import * as bcrypt from 'bcryptjs'

const accplugin = new class AccountPluginClass {
  async createAccount(username: string, password: string, email: string, admin: number) {
    if(!vdb.db)
      return

    const password_hash = await bcrypt.hash(password, 10)

    return await vdb.db.insertInto('account').values({
      username,
      password: password_hash,
      email,
      admin,
    }).executeTakeFirstOrThrow()
  }

  async findAccount(criteria: Partial<AccountTable>, single: boolean = true) {
    if(!vdb.db)
      return

    let query = vdb.db.selectFrom('account')

    if(criteria.id)
      query = query.where('id', '=', criteria.id as unknown as number)

    if(criteria.username)
      query = query.where('username', '=', criteria.username)

    if(criteria.email)
      query = query.where('email', '=', criteria.email)

    return await query.selectAll().execute()
  }

  async updateAccount(id: number, updateWith: Updateable<AccountTable>){
    if(!vdb.db)
      return

    return await vdb.db.updateTable('account').set(updateWith).where('id', '=', id).execute()
  }

  deleteAccount(id: number){
    if(!vdb.db)
      return

    return vdb.db.deleteFrom('account').where('id', '=', id).returningAll().executeTakeFirst()
  }

  async login(username: string, password: string) {
    if(!vdb.db)
      return

    const acc = await vdb.db.selectFrom('account')
      .where('username', '=', username)
      .selectAll()
      .executeTakeFirst()

    if(!acc)
      return

    if(!await bcrypt.compare(password, acc.password))
      return

    return acc
  }

  async count () {
    if(!vdb.db)
      return

    return (await vdb.db.selectFrom('account').select(vdb.db.fn.countAll().as("count")).executeTakeFirstOrThrow()).count
  }
}

export const accountPlugin = createPlugin<BasePlugin & 
  typeof accplugin
>({
  name: 'vrage-account',
  version: '0.1.0',
  
  async databaseload() {
    if(!vdb.db)
      return

    await vdb.db.schema.createTable('account').ifNotExists()
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('username', 'varchar', col => col.unique().notNull())
    .addColumn('password', 'varchar', col => col.notNull())
    .addColumn('admin', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('email', 'varchar', col => col.unique())
    .addColumn('created_at', 'timestamp', col => col.notNull().defaultTo('now()'))
    .execute()
  },

  createAccount: accplugin.createAccount.bind(accplugin),
  findAccount: accplugin.findAccount.bind(accplugin),
  updateAccount: accplugin.updateAccount.bind(accplugin),
  deleteAccount: accplugin.deleteAccount.bind(accplugin),
  login: accplugin.login.bind(accplugin),
  count: accplugin.count.bind(accplugin)
})

declare global {
  interface VDatabaseTables {
    account: AccountTable
  }
  interface VPlugins {
    'vrage-account': typeof accountPlugin
  }
}

export {}