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
var BrowserManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer-core");
const Utils_1 = require("./Utils");
const _ = require('lodash');
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let BrowserManager = BrowserManager_1 = class BrowserManager {
    constructor(configService) {
        this.configService = configService;
        this.pagePools = [];
        this.isInited = false;
        this.pageInUse = {};
        console.log('browser init');
        const puppeteerConfig = this.configService.get("PUPPETEER");
        console.log(`puppeteerConfig:${JSON.stringify(puppeteerConfig)}`);
        BrowserManager_1._instance = this;
    }
    static I() {
        if (!BrowserManager_1._instance) {
            throw ("dont have BrowserManager instance");
        }
        return BrowserManager_1._instance;
    }
    getBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.browser;
        });
    }
    doInit(headless = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const puppeteerConfig = this.configService.get("PUPPETEER");
            if (!this.browser) {
                for (let i = 0; i < 100; i++) {
                    try {
                        const options = {
                            headless,
                        };
                        this.browser = yield puppeteer.connect({
                            browserWSEndpoint: `ws://${puppeteerConfig.host}:${puppeteerConfig.port}`,
                            ignoreHTTPSErrors: true
                        });
                        yield this.initPagePool();
                        this.isInited = true;
                        console.warn(`已连接到puppeteer`);
                        break;
                    }
                    catch (error) {
                        console.log(`连接puppeteer发生异常:${error.message}, 1秒后将重试!`);
                        yield Utils_1.default.sleep(1000);
                    }
                }
            }
            return this.browser;
        });
    }
    initPagePool() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pagePools = [];
            const pages = yield this.browser.pages();
            const waitpages = 10;
            for (let i = 0; i < (waitpages - pages.length); i++) {
                const page = yield this.browser.newPage();
            }
            this.pagePools = pages;
        });
    }
    askPage(tag = "") {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 20; i++) {
                if (!this.isInited) {
                    yield Utils_1.default.sleep(1000);
                    continue;
                }
                const page = this.pagePools.shift();
                if (page) {
                    return page;
                }
                else {
                    yield Utils_1.default.sleep(1000);
                }
            }
        });
    }
    pickSpecPageByUrl(urlPrefix, urlReg) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 10; i++) {
                const pages = yield this.browser.pages();
                for (const page of pages) {
                    const url = page.url();
                    if (_.startsWith(url, urlPrefix)) {
                        const is = urlReg.test(url);
                        if (urlReg.test(url)) {
                            return page;
                        }
                    }
                }
                yield Utils_1.default.sleep(1000);
            }
            return false;
        });
    }
    releasePage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield page.goto("about:blank");
                this.pagePools.push(page);
            }
            catch (error) {
                console.warn(error);
            }
        });
    }
};
BrowserManager = BrowserManager_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BrowserManager);
exports.default = BrowserManager;
//# sourceMappingURL=browser.manager.js.map