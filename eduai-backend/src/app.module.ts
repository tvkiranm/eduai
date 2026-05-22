import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { MediaModule } from './modules/media/media.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { AdminModule } from './modules/admin/admin.module';
import { StudentModule } from './modules/student/student.module';
import { APP_GUARD } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: seconds(60), limit: 5 }],
      errorMessage: 'Too many attempts. Please try again later.',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const db = config.get<TypeOrmModuleOptions>('database');
        if (!db) {
          throw new Error('Missing database config (key: "database")');
        }
        return db;
      },
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    CoursesModule,
    MediaModule,
    TeacherModule,
    AdminModule,
    StudentModule,
  ],
})
export class AppModule {}
