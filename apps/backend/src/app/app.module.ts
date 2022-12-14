import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { NodesModule } from './modules/nodes/nodes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvConfig } from '../environments/env-config';
import { IEnvironment } from '../environments/env.interface';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getEnvConfig],
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const database: IEnvironment['database'] =
          configService.get('database');

        const isProduction: boolean = configService.get('production');

        return {
          type: 'postgres',
          host: database.host,
          port: database.port,
          username: database.username,
          password: database.password,
          database: database.database,
          synchronize: !isProduction,
          autoLoadEntities: true,
        };
      },
    }),
    UsersModule,
    WorkspacesModule,
    NodesModule,
    AuthModule,
  ],
})
export class AppModule {}
