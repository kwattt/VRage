import { ColumnType, Generated } from "kysely"

export interface AccountTable {
  id: Generated<number>
  username: string
  password: string
  admin: number
  email?: string
  created_at: ColumnType<Date, string | undefined, never>
}