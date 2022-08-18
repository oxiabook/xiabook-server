import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksQueryEntity } from '../entity/booksquery.entity';
import { ChapterEntity } from '../entity/chapter.entity';
import { SpiderController } from './spider.controller';
import { SpiderManagerService } from './spidermanager.service';
// import { fsStore } from 'cache-manager-fs-binary';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { SpiderProcessor } from './spider.processor';
import BrowserManager from './browser.manager';

@Module({
    imports: [
        TypeOrmModule.forFeature([BooksQueryEntity, ChapterEntity]),
        CacheModule.register(),
        ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'SpiderQueue'
        }),
        // BullModule.forRootAsync({
        //     name: 'SpiderQueue',
        //     imports: [ConfigModule],
        //     useFactory: async (configService: ConfigService) => ({
        //       redis: {
        //         host: configService.get('REDIS').host,
        //         port: configService.get('REDIS').port,
        //       },
        //     }),
        //     inject: [ConfigService],
        // })
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
