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

  @Column()
  index: number;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  nextIdx?: number;

  @Column({ nullable: true })
  nextIdxIfTrue?: number;

  @Column({ nullable: true })
  nextIdxIfFalse?: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.nodes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  workspace: Workspace[];
}
