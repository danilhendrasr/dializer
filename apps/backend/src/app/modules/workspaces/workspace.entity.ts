import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Node } from '../nodes/node.entity';
import { User } from '../users/user.entity';
import { WorkspaceEntity, WorkspaceVisibility } from '@dializer/types';

@Entity()
export class Workspace implements WorkspaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: WorkspaceVisibility,
    default: WorkspaceVisibility.PRIVATE,
  })
  visibility: WorkspaceVisibility;

  @ManyToOne(() => User, (user) => user.workspaces)
  owner: User;

  @OneToMany(() => Node, (node) => node.workspace, { cascade: true })
  nodes: Node[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
