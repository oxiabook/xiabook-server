import { Module, CacheModule} from '@nestjs/common';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from './books.entity';
import { ChapterEntity } from '../entity/chapter.entity';
import { BooksService } from './books.service';
// import { SpiderModule } from "../spider/spider.module";
import { SpiderManagerService } from '../spider/spidermanager.service';
import { BooksQueryEntity } from '../entity/booksquery.entity';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import BrowserManager from '../spider/browser.manager';

@Module({
    imports: [
        TypeOrmModule.forFeature([BooksEntity, ChapterEntity, BooksQueryEntity]),
        
        // CacheModule.register(
        //     {
        //         store: redisStore,
        //         host: '127.0.0.1',
        //         port: 6379,
        //         db: 0,
        //         options: {
        //             reviveBuffers: true,
        //             binaryAsStream: true,
        //             ttl: 60 * 60 /* seconds */,
        //             maxsize: 1000 * 1000 * 1000 /* max size in bytes on disk */,
        //             path: 'diskcache',
        //             preventfill: true,
        //         },
        //     }
        // ),
        // ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'SpiderQueue',
        }),
    ],
    providers: [BooksService, SpiderManagerService],
    controllers: [BooksController],
})
export class BooksModule {}
