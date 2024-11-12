import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
} from "typeorm"

import * as bcrypt from 'bcryptjs'

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    unique: true,
  })
  name: string = ''

  @Column({
    nullable: false
  })
  password: string = ''

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }

  async checkPassword(password: string) {
    return await bcrypt.compare(password, this.password)
  }

  @Column({
    default: 0
  })
  admin: number = 0
}