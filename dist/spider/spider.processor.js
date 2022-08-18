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
exports.SpiderProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const spidermanager_service_1 = require("./spidermanager.service");
let SpiderProcessor = class SpiderProcessor {
    constructor(spiderManager) {
        this.spiderManager = spiderManager;
    }
    BookInit(job) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`quene processor:BookInit ${JSON.stringify(job)}`);
            yield this.doBookInit(job.data);
            job.progress(100);
            return {};
        });
    }
    ChapterPreGrab(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`quene processor:ChapterPreGrab ${job.id}`);
            const ret = yield this.prefetchChapter(job.data);
            done(null, ret);
            console.log(`quene processor:ChapterPreGrab ${job.id} done`);
            return ret;
        });
    }
    ReQueryBook(job) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`quene processor:ReQueryBook ${JSON.stringify(job)}`);
            yield this.reQueryBook(job.data);
            job.progress(100);
            return {};
        });
    }
    GrabQDBookChapters(job) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`quene processor:ChapterPreGrab ${JSON.stringify(job)}`);
            yield this.grabQDBookChapter(job.data);
            job.progress(100);
            return {};
        });
    }
    onActive(job) {
    }
    prefetchChapter(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookName = data.bookName;
            let indexId = data.indexId;
            indexId = parseInt(indexId);
            const ret = yield this.spiderManager.grabBookChapter(bookName, indexId);
            return ret;
        });
    }
    doBookInit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`doBookInit:${JSON.stringify(data)}`);
            const bookName = data.bookName;
            yield this.spiderManager.queryBookSites(bookName);
            yield this.spiderManager.grabQDBookChapter(bookName);
            for (let i = 0; i <= 10; i++) {
                yield this.spiderManager.grabBookChapter(bookName, 1);
            }
        });
    }
    grabQDBookChapter(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`grabQDBookChapter:${JSON.stringify(data)}`);
            const bookName = data.bookName;
            yield this.spiderManager.grabQDBookChapter(bookName);
        });
    }
    reQueryBook(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`reQueryBook:${JSON.stringify(data)}`);
            const bookName = data.bookName;
            yield this.spiderManager.queryBookSites(bookName);
        });
    }
};
__decorate([
    (0, bull_1.Process)("BookInit"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpiderProcessor.prototype, "BookInit", null);
__decorate([
    (0, bull_1.Process)("ChapterPreGrab"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SpiderProcessor.prototype, "ChapterPreGrab", null);
__decorate([
    (0, bull_1.Process)("ReQueryBook"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpiderProcessor.prototype, "ReQueryBook", null);
__decorate([
    (0, bull_1.Process)("GrabQDBookChapters"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpiderProcessor.prototype, "GrabQDBookChapters", null);
__decorate([
    (0, bull_1.OnQueueActive)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpiderProcessor.prototype, "onActive", null);
SpiderProcessor = __decorate([
    (0, bull_1.Processor)('SpiderQueue'),
    __metadata("design:paramtypes", [spidermanager_service_1.SpiderManagerService])
], SpiderProcessor);
exports.SpiderProcessor = SpiderProcessor;
//# sourceMappingURL=spider.processor.js.map