import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { NodesModule } from './modules/nodes/nodes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoggerModule } from './modules/logger/logger.module';
import { validateEnvVariables } from './shared/functions/validations';
import { EnvSchema } from './shared/types';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      validate: validateEnvVariables,
      isGlobal: true,
      cache: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvSchema>) => {
        const emailUsername = configService.get('EMAIL_USERNAME');
        const emailPassword = configService.get('EMAIL_PASSWORD');

        return {
          transport: {
            service: 'gmail',
            auth: {
              user: emailUsername,
              pass: emailPassword,
            },
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvSchema>) => {
        const env = configService.get('ENV');

        const dbHost = configService.get('DB_HOST');
        const dbPort = configService.get('DB_PORT');
        const dbUsername = configService.get('DB_USERNAME');
        const dbPassword = configService.get('DB_PASSWORD');
        const dbName = configService.get('DB_NAME');

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          synchronize: env !== 'production',
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
