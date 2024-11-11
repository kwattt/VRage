import {  PrimaryGeneratedColumn, Column, TableInheritance, UpdateDateColumn, BeforeInsert, BaseEntity } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ExtendableEntity } from '../decorators';

@ExtendableEntity()
export class BaseAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: false })
  password: string = '';

  @UpdateDateColumn()
  last_update: Date;

  @BeforeInsert()
  protected async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async checkPassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }
}
