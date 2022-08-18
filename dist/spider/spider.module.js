"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const booksquery_entity_1 = require("../entity/booksquery.entity");
const chapter_entity_1 = require("../entity/chapter.entity");
const spider_controller_1 = require("./spider.controller");
const spidermanager_service_1 = require("./spidermanager.service");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const spider_processor_1 = require("./spider.processor");
const browser_manager_1 = require("./browser.manager");
let SpiderModule = class SpiderModule {
    onModuleInit() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`SpiderModule:onModuleInit`);
            const browserManager = browser_manager_1.default.I();
            yield browserManager.doInit();
        });
    }
};
SpiderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([booksquery_entity_1.BooksQueryEntity, chapter_entity_1.ChapterEntity]),
            common_1.CacheModule.register(),
            config_1.ConfigModule.forRoot(),
            bull_1.BullModule.registerQueue({
                name: 'SpiderQueue'
            }),
        ],
        controllers: [spider_controller_1.SpiderController],
        providers: [spidermanager_service_1.SpiderManagerService, spider_processor_1.SpiderProcessor],
        exports: [spidermanager_service_1.SpiderManagerService]
    })
], SpiderModule);
exports.SpiderModule = SpiderModule;
//# sourceMappingURL=spider.module.js.map