import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspaces.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  exports: [TypeOrmModule],
})
export class WorkspacesModule {}
