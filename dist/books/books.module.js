"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksModule = void 0;
const common_1 = require("@nestjs/common");
const books_controller_1 = require("./books.controller");
const typeorm_1 = require("@nestjs/typeorm");
const books_entity_1 = require("./books.entity");
const chapter_entity_1 = require("../entity/chapter.entity");
const books_service_1 = require("./books.service");
const spidermanager_service_1 = require("../spider/spidermanager.service");
const booksquery_entity_1 = require("../entity/booksquery.entity");
const redisStore = require("cache-manager-redis-store");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
let BooksModule = class BooksModule {
};
BooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([books_entity_1.BooksEntity, chapter_entity_1.ChapterEntity, booksquery_entity_1.BooksQueryEntity]),
            common_1.CacheModule.register({
                store: redisStore,
                host: '127.0.0.1',
                port: 6379,
                db: 0,
                options: {
                    reviveBuffers: true,
                    binaryAsStream: true,
                    ttl: 60 * 60,
                    maxsize: 1000 * 1000 * 1000,
                    path: 'diskcache',
                    preventfill: true,
                },
            }),
            config_1.ConfigModule.forRoot(),
            bull_1.BullModule.registerQueue({
                name: 'SpiderQueue',
            }),
        ],
        providers: [books_service_1.BooksService, spidermanager_service_1.SpiderManagerService],
        controllers: [books_controller_1.BooksController],
    })
], BooksModule);
exports.BooksModule = BooksModule;
//# sourceMappingURL=books.module.js.map