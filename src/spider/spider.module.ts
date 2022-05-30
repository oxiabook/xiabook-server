import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksQueryEntity } from '../entity/booksquery.entity';
import { ChapterEntity } from '../entity/chapter.entity';
import { SpiderController } from './spider.controller';
import { SpiderManagerService } from './spidermanager.service';
// import { fsStore } from 'cache-manager-fs-binary';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { SpiderProcessor } from './spider.processor';
import BrowserManager from './browser.manager';

@Module({
    imports: [
        TypeOrmModule.forFeature([BooksQueryEntity, ChapterEntity]),
        CacheModule.register({
            store: redisStore,
            host: '127.0.0.1',
            port: 6379,
            db: 0,
            options: {
                reviveBuffers: true,
                binaryAsStream: true,
                ttl: 60 * 60 /* seconds */,
                maxsize: 1000 * 1000 * 1000 /* max size in bytes on disk */,
                path: 'diskcache',
                preventfill: true,
            },
        }),ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'SpiderQueue'
        }),
    ],
    controllers: [SpiderController],
    providers: [SpiderManagerService, SpiderProcessor],
    exports: [SpiderManagerService]
})
export class SpiderModule {
    async onModuleInit(): Promise<void> {
        // await this.fetch();
        console.log(`SpiderModule:onModuleInit`)
        const browserManager = BrowserManager.I();
        await browserManager.doInit();
    }
}
