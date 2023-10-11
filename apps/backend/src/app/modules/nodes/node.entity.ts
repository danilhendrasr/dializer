import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { NodeTypes } from '@dializer/types';

@Entity()
export class Node {
  @PrimaryColumn({ comment: 'ULID' })
  id!: string;

  @Column({ enum: NodeTypes, type: 'enum' })
  type!: NodeTypes;

  @Column()
  x!: number;

  @Column()
  y!: number;

  @Column()
  width!: number;

  @Column()
  height!: number;

  @Column({ nullable: true })
  content?: string;

  @Column({
    nullable: true,
    comment:
      'Refers to the next node in the true path for branching and looping nodes.',
  })
  next?: string;

  @Column({
    nullable: true,
    comment:
      'Refers to the next node in the false path for branching and looping nodes.',
  })
  nextIfFalse?: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.nodes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  workspace!: Workspace[];
}
