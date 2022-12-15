import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  providers: [WorkspacesService],
  exports: [TypeOrmModule, WorkspacesService],
})
export class WorkspacesModule {}
