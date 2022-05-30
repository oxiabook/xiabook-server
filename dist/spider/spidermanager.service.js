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
exports.SpiderManagerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_validator_1 = require("class-validator");
const typeorm_2 = require("typeorm");
const booksquery_entity_1 = require("../entity/booksquery.entity");
const chapter_entity_1 = require("../entity/chapter.entity");
const spider_define_1 = require("./spider.define");
const spider_fatrory_1 = require("./spider.fatrory");
const _ = require("lodash");
const Utils_1 = require("./Utils");
const fs = require("fs");
const bull_1 = require("@nestjs/bull");
let SpiderManagerService = class SpiderManagerService {
    constructor(queryRepository, chapterRepository, cacheManager, spiderQueue) {
        this.queryRepository = queryRepository;
        this.chapterRepository = chapterRepository;
        this.cacheManager = cacheManager;
        this.spiderQueue = spiderQueue;
        console.log(`SpiderManagerService: constructor`);
    }
    queryBookSites(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const sites = [spider_define_1.SpiderSite.QD, spider_define_1.SpiderSite.QBIQU, spider_define_1.SpiderSite.XSJPW, spider_define_1.SpiderSite.XBIQUKAN, spider_define_1.SpiderSite.HAOTXT8];
            for (const site of sites) {
                const queryEntity = yield this.getLocalBookQuery(name, site);
                if (queryEntity) {
                    continue;
                }
                const spider = yield spider_fatrory_1.SpiderFactory.createSpider(site);
                const bookQueryVO = yield spider.queryBook(name);
                console.log(`queryBookSites:site:${site} ${JSON.stringify(bookQueryVO)}`);
                if (!bookQueryVO)
                    continue;
                yield this.saveBookQuery(bookQueryVO);
                yield Utils_1.default.sleep(1000);
            }
        });
    }
    grabSiteChaptersFromCache(site, bookName) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `bookchapters_${site}_${bookName}`;
            let siteChapters = yield this.cacheManager.get(key);
            if (_.isEmpty(siteChapters)) {
                const spider = yield spider_fatrory_1.SpiderFactory.createSpider(site);
                const bookQueryVO = yield spider.queryBook(bookName);
                if (!bookQueryVO)
                    return [];
                siteChapters = yield spider.fetchBookChapters(bookQueryVO.indexPage);
                yield this.cacheManager.set(key, siteChapters, { ttl: 36000 });
            }
            return siteChapters;
        });
    }
    grabOneChapter(bookName, qdChapterEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            const allQuerys = yield this.getBookAllQuery(bookName);
            for (const queryEntity of allQuerys) {
                console.log(`grabOneChapter:${queryEntity.siteKey} ${bookName} ${qdChapterEntity.indexId}`);
                const siteChapters = yield this.grabSiteChaptersFromCache(queryEntity.siteKey, bookName);
                if (siteChapters.length == 0)
                    continue;
                for (const siteChapterVO of siteChapters) {
                    if (qdChapterEntity.title != siteChapterVO.title) {
                        continue;
                    }
                    console.log(`${queryEntity.siteKey} qd:${qdChapterEntity.title} - ${siteChapterVO.title}`);
                    siteChapterVO.indexId = qdChapterEntity.indexId;
                    const spider = yield spider_fatrory_1.SpiderFactory.createSpider(queryEntity.siteKey);
                    const chapterContentVO = yield spider.fetchChapterDetail(siteChapterVO);
                    if (chapterContentVO.content) {
                        queryEntity.weight = queryEntity.weight + 1;
                        if (queryEntity.weight > 100)
                            queryEntity.weight = 100;
                    }
                    else {
                        queryEntity.weight = queryEntity.weight - 1;
                    }
                    yield this.updateBookQueryWeight(queryEntity);
                    yield this.saveChapterContent(bookName, chapterContentVO);
                    yield this.updateChapterFetched(bookName, chapterContentVO.indexId);
                }
                break;
            }
        });
    }
    grabBookChapters(bookName, indexs) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`grabBookChapters:${bookName}, ${indexs}`);
            const qdChapters = yield this.queryBookNeedFetchChapters(bookName, indexs);
            for (const qdChapterEntity of qdChapters) {
                yield this.grabOneChapter(bookName, qdChapterEntity);
                yield Utils_1.default.sleep(3000);
            }
        });
    }
    saveChapterContent(bookName, chapterContentVO) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`saveChapterContent: indexId ${chapterContentVO.indexId}`);
            bookName = _.trim(bookName);
            const content = `# ${bookName} \n ## ${chapterContentVO.title}\n ${chapterContentVO.content} \n${chapterContentVO.siteKey}`;
            const filename = `${process.cwd()}/runtime/books/${bookName}/${chapterContentVO.indexId}.md`;
            Utils_1.default.checkdir(filename);
            fs.writeFileSync(filename, content);
        });
    }
    updateBookQueryWeight(bookQueryEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.queryRepository.save(bookQueryEntity);
        });
    }
    updateChapterFetched(bookName, indexId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.chapterRepository.update({ bookName, indexId }, { isFetched: 1 });
            return res.affected === 1;
        });
    }
    grabQDBookChapter(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookQueryEntity = yield this.getLocalBookQuery(name, spider_define_1.SpiderSite.QD);
            const spider = yield spider_fatrory_1.SpiderFactory.createSpider(spider_define_1.SpiderSite.QD);
            const chapters = yield spider.fetchBookChapters(bookQueryEntity.indexPage);
            yield this.saveQDBookChapters(name, chapters);
            return chapters;
        });
    }
    queryLocalChapters(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const siteKey = spider_define_1.SpiderSite.QD;
            const chapters = yield this.chapterRepository
                .createQueryBuilder('ChapterEntity')
                .where('bookName = :name AND siteKey = :siteKey ', { name, siteKey })
                .orderBy('indexId')
                .getMany();
            return chapters;
        });
    }
    queryBookNeedFetchChapters(name, indexs) {
        return __awaiter(this, void 0, void 0, function* () {
            const siteKey = spider_define_1.SpiderSite.QD;
            const isFetched = '0';
            const chapters = yield this.chapterRepository
                .createQueryBuilder('ChapterEntity')
                .where('bookName = :name AND siteKey = :siteKey AND isFetched = :isFetched', { name, siteKey, isFetched })
                .andWhere('indexId in (:...indexs)', { indexs })
                .orderBy('indexId')
                .getMany();
            return chapters;
        });
    }
    getBookAllQuery(bookName) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
            query.where('bookName = :bookName AND siteKey != :siteKey', { bookName, siteKey: spider_define_1.SpiderSite.QD });
            query.orderBy('weight', 'DESC');
            const bookQueryEntitys = yield query.getMany();
            return bookQueryEntitys;
        });
    }
    getLocalBookQuery(name, siteKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
            query.where('bookName = :name AND siteKey = :siteKey', { name, siteKey });
            const bookQueryEntity = yield query.getOne();
            return bookQueryEntity;
        });
    }
    saveQDBookChapters(name, chapters) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const chapterVO of chapters) {
                const chapterEntity = new chapter_entity_1.ChapterEntity();
                chapterEntity.bookName = name;
                chapterEntity.title = chapterVO.title;
                chapterEntity.indexId = chapterVO.index;
                chapterEntity.isFetched = 0;
                chapterEntity.isValid = 0;
                chapterEntity.siteKey = spider_define_1.SpiderSite.QD;
                chapterEntity.chapterURL = chapterVO.chapterURL;
                const errors = yield (0, class_validator_1.validate)(chapterEntity);
                try {
                    if (errors.length > 0) {
                        const _errors = { username: 'Userinput is not valid.' };
                        throw new common_1.HttpException({ message: 'Input data validation failed', _errors }, common_1.HttpStatus.BAD_REQUEST);
                    }
                    else {
                        yield this.chapterRepository.save(chapterEntity);
                        console.log(`savedChapter:${chapterEntity.id}`);
                    }
                }
                catch (error) {
                    console.error(error.message);
                    continue;
                }
            }
        });
    }
    saveBookQuery(bookQueryVO) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`saveBookQuery:${JSON.stringify(bookQueryVO)}`);
            const newBookQuery = new booksquery_entity_1.BooksQueryEntity();
            newBookQuery.bookName = bookQueryVO.bookName;
            newBookQuery.author = bookQueryVO.author;
            newBookQuery.bookimg = bookQueryVO.bookimg;
            newBookQuery.indexPage = bookQueryVO.indexPage;
            newBookQuery.siteKey = bookQueryVO.siteKey;
            newBookQuery.status = bookQueryVO.status;
            const errors = yield (0, class_validator_1.validate)(newBookQuery);
            if (errors.length > 0) {
                const _errors = { username: 'Userinput is not valid.' };
                throw new common_1.HttpException({ message: 'Input data validation failed', _errors }, common_1.HttpStatus.BAD_REQUEST);
            }
            else {
                const savedBook = yield this.queryRepository.save(newBookQuery);
                return savedBook;
            }
        });
    }
    grabBookQDChapters(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(name);
        });
    }
};
SpiderManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booksquery_entity_1.BooksQueryEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(chapter_entity_1.ChapterEntity)),
    __param(2, (0, common_1.Inject)(common_1.CACHE_MANAGER)),
    __param(3, (0, bull_1.InjectQueue)('SpiderQueue')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, Object])
], SpiderManagerService);
exports.SpiderManagerService = SpiderManagerService;
//# sourceMappingURL=spidermanager.service.js.map