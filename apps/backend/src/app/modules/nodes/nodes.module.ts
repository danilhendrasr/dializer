import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Node } from './node.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Node]),
    forwardRef(() => WorkspacesModule),
  ],
  exports: [TypeOrmModule],
})
export class NodesModule {}
