import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CardController } from './card/card.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { Card } from './card/card.entity';
import { CardModule } from './card/card.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '45.117.101.228',
      port: 3306,
      username: 'dongyun',
      password: '_Bestwjc123',
      database: 'flashcard',
      // entities: ['dist/**/*.entity{.ts,.js}'],
      entities: [Card],
      synchronize: true,
    }),
    CardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
