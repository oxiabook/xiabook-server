"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const books_module_1 = require("./books/books.module");
const typeorm_1 = require("@nestjs/typeorm");
const spider_module_1 = require("./spider/spider.module");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const configuration_1 = require("./config/configuration");
const env_validation_1 = require("./config/env.validation");
const browser_manager_1 = require("./spider/browser.manager");
console.log("configuration", configuration_1.default);
let AppModule = class AppModule {
    constructor(configService) {
        this.configService = configService;
        console.log("AppModule init");
        const database = configService.get("DATABASE");
        console.log("typeorm", database);
        const redis = configService.get("REDIS");
        console.log("redis", redis);
        const puppeteer = configService.get("PUPPETEER");
        console.log("puppeteer", puppeteer);
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            spider_module_1.SpiderModule,
            books_module_1.BooksModule,
            config_1.ConfigModule.forRoot({
                load: [configuration_1.default],
                isGlobal: true,
                validate: env_validation_1.validate
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => config.get('DATABASE'),
                inject: [config_1.ConfigService]
            }),
            common_1.CacheModule.register({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => __awaiter(void 0, void 0, void 0, function* () { return (configService.get('REDIS')); }),
                inject: [config_1.ConfigService],
            }), config_1.ConfigModule.forRoot(),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => __awaiter(void 0, void 0, void 0, function* () {
                    return ({
                        redis: {
                            host: configService.get('REDIS').host,
                            port: configService.get('REDIS').port,
                            password: configService.get('REDIS').password
                        },
                    });
                }),
                inject: [config_1.ConfigService],
            })
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, browser_manager_1.default],
        exports: [browser_manager_1.default]
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map