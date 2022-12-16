import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { NodeTypes } from '@dializer/types';

@Entity()
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: NodeTypes, type: 'enum' })
  type: NodeTypes;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  next?: number;

  @Column({ nullable: true })
  nextIfTrue?: number;

  @Column({ nullable: true })
  nextIfFalse?: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.nodes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  workspace: Workspace[];
}
