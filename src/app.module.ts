import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiderModule } from './spider/spider.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import BrowserManager from './spider/browser.manager';
import { SpiderManagerService } from './spider/spidermanager.service';
console.log("configuration", configuration);

@Module({
    imports: [
        SpiderModule,
        BooksModule,
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            validate
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => config.get('DATABASE'),
            inject: [ConfigService]
        }),
        // CacheModule.register(),
        CacheModule.register({
            isGlobal:true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => (configService.get('REDIS')),
            inject: [ConfigService],
            // store: redisStore,
            // host: '127.0.0.1',
            // port: 6379,
            // db: 0,
            // options: {
            //     reviveBuffers: true,
            //     binaryAsStream: true,
            //     ttl: 60 * 60 /* seconds */,
            //     maxsize: 1000 * 1000 * 1000 /* max size in bytes on disk */,
            //     path: 'diskcache',
            //     preventfill: true,
            // },
        }),ConfigModule.forRoot(),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              redis: {
                host: configService.get('REDIS').host,
                port: configService.get('REDIS').port,
                password:configService.get('REDIS').password
              },
            }),
            inject: [ConfigService],
        })
    ],
    controllers: [AppController],
    providers: [AppService, BrowserManager],
    exports:[BrowserManager]
})
export class AppModule {
    constructor(
        private readonly configService: ConfigService,
      ) {
        console.log("AppModule init");
        const database = configService.get("DATABASE")
        console.log("typeorm", database);
        const redis = configService.get("REDIS")
        console.log("redis", redis);
        const puppeteer = configService.get("PUPPETEER")
        console.log("puppeteer", puppeteer);
      }
}
