import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { Exclude } from 'class-transformer';
import { UserEntity } from '@dializer/types';

@Entity()
export class User implements UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Workspace, (workspace) => workspace.owner)
  workspaces?: Workspace[];
}
