import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './cats/cats.controller';
import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiderModule } from './spider/spider.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        SpiderModule,
        BooksModule,
        TypeOrmModule.forRoot(),
        CacheModule.register(),
        ConfigModule.forRoot({
            isGlobal: true,
            // ROOT_PATH : path.dirname()
        }),
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
        })
    ],
    controllers: [AppController, CatsController],
    providers: [AppService],
})
export class AppModule {}
