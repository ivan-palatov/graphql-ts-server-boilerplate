import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Index } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column('varchar', { length: 255 })
  email: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('boolean', { default: false })
  confirmed: boolean;
}
