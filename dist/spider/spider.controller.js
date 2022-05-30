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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.SpiderController = void 0;
const common_1 = require("@nestjs/common");
const spider_define_1 = require("./spider.define");
const spider_fatrory_1 = require("./spider.fatrory");
const spidermanager_service_1 = require("./spidermanager.service");
const Utils_1 = require("./Utils");
const fs = require("fs");
let SpiderController = class SpiderController {
    constructor(spiderManager) {
        this.spiderManager = spiderManager;
    }
    newbook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('controller newBook');
            yield this.spiderManager.queryBookSites(name);
            return 'ok';
        });
    }
    testSpider(bookname) {
        return __awaiter(this, void 0, void 0, function* () {
            const spider = yield spider_fatrory_1.SpiderFactory.createSpider(spider_define_1.SpiderSite.XBIQUKAN);
            const bookQueryVO = yield spider.queryBook(bookname);
            console.log(`bookQueryVO:${JSON.stringify(bookQueryVO)}`);
            yield Utils_1.default.sleep(3000);
            if (!bookQueryVO) {
                return;
            }
            const chapters = yield spider.fetchBookChapters(bookQueryVO.indexPage);
            console.log(`chapters:${JSON.stringify(chapters)}`);
            yield Utils_1.default.sleep(3000);
            const chapterDetail = yield spider.fetchChapterDetail(chapters[10]);
            console.log(`chapterDetail:${JSON.stringify(chapterDetail)}`);
            yield Utils_1.default.sleep(3000);
            const chapterDetail2 = yield spider.fetchChapterDetail(chapters[20]);
            fs.writeFileSync("xxxx.md", chapterDetail2.content);
            console.log(`chapterDetail2:${JSON.stringify(chapterDetail2)}`);
            return 'ok';
        });
    }
};
__decorate([
    (0, common_1.Get)('/newbook/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpiderController.prototype, "newbook", null);
__decorate([
    (0, common_1.Get)('/testSpider/:bookname'),
    __param(0, (0, common_1.Param)('bookname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpiderController.prototype, "testSpider", null);
SpiderController = __decorate([
    (0, common_1.Controller)('spider'),
    __metadata("design:paramtypes", [spidermanager_service_1.SpiderManagerService])
], SpiderController);
exports.SpiderController = SpiderController;
//# sourceMappingURL=spider.controller.js.map