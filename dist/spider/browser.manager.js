"use strict";
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
const puppeteer = require("puppeteer");
const Utils_1 = require("./Utils");
class BrowserManager {
    constructor() {
        this.pagePools = [];
        this.isInited = false;
        BrowserManager._instance = this;
    }
    static I() {
        if (!BrowserManager._instance) {
            new BrowserManager();
        }
        return BrowserManager._instance;
    }
    doInit(headless = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                const options = {
                    headless,
                };
                this.browser = yield puppeteer.launch(options);
                this.pagePools = [];
                for (let i = 0; i < 5; i++) {
                    const page = yield this.browser.newPage();
                    this.pagePools.push(page);
                }
                this.isInited = true;
            }
            return this.browser;
        });
    }
    askPage() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 20; i++) {
                if (!this.isInited) {
                    yield Utils_1.default.sleep(1000);
                    continue;
                }
                if (this.pagePools.length === 0) {
                    yield Utils_1.default.sleep(1000);
                    continue;
                }
                const page = this.pagePools.pop();
                return page;
            }
        });
    }
    releasePage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.goto("about:blank");
            this.pagePools.push(page);
        });
    }
}
exports.default = BrowserManager;
//# sourceMappingURL=browser.manager.js.map