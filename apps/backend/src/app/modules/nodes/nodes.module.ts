import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Node } from './node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Node]), WorkspacesModule],
  exports: [TypeOrmModule],
})
export class NodesModule {}
