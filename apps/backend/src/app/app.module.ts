import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { NodesModule } from './modules/nodes/nodes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'dializer',
      database: 'postgres',
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    WorkspacesModule,
    NodesModule,
  ],
})
export class AppModule {}
