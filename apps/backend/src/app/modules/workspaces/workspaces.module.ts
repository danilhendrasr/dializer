import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { NodesModule } from '../nodes/nodes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace]), NodesModule],
  providers: [WorkspacesService],
  exports: [TypeOrmModule, WorkspacesService],
  controllers: [WorkspacesController],
})
export class WorkspacesModule {}
