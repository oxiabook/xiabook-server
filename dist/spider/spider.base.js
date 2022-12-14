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
exports.BaseSpider = void 0;
const browser_manager_1 = require("./browser.manager");
class BaseSpider {
    doInit() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser_manager_1.default.I().getBrowser();
        });
    }
    askPage(tag = "") {
        return __awaiter(this, void 0, void 0, function* () {
            return yield browser_manager_1.default.I().askPage(tag);
        });
    }
    releasePage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser_manager_1.default.I().releasePage(page);
        });
    }
    pickSpecPageByUrl(urlPrefix, reg) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield browser_manager_1.default.I().pickSpecPageByUrl(urlPrefix, reg);
        });
    }
}
exports.BaseSpider = BaseSpider;
//# sourceMappingURL=spider.base.js.map