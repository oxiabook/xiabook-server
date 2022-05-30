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
exports.BooksController = void 0;
const common_1 = require("@nestjs/common");
const spidermanager_service_1 = require("../spider/spidermanager.service");
const books_service_1 = require("./books.service");
const bull_1 = require("@nestjs/bull");
const fs = require("fs");
let BooksController = class BooksController {
    constructor(booksService, spiderManagerService, spiderQueue) {
        this.booksService = booksService;
        this.spiderManagerService = spiderManagerService;
        this.spiderQueue = spiderQueue;
    }
    newbook(body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`controller newBook ${JSON.stringify(body)}`);
            const bookName = body.bookName;
            console.log(`name:${bookName}`);
            let booksEntity = yield this.booksService.getBookByName(bookName);
            if (!booksEntity) {
                booksEntity = yield this.booksService.newWantBook(bookName);
            }
            yield this.spiderManagerService.queryBookSites(bookName);
            yield this.spiderManagerService.grabQDBookChapter(bookName);
            yield this.spiderManagerService.grabBookChapters(bookName, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            yield this.spiderQueue.add('BookInit', {
                bookName: bookName,
            });
            return booksEntity;
        });
    }
    getBooks(body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`controller getBooks ${JSON.stringify(body)}`);
            const booksEntitys = yield this.booksService.getBooks();
            return booksEntitys;
        });
    }
    reQueryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.spiderQueue.add('ReQueryBook', {
                bookName: name,
            });
        });
    }
    bookhome(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookEntity = yield this.booksService.getBookByName(name);
            const bookChapters = yield this.spiderManagerService.queryLocalChapters(name);
            if (bookChapters.length == 0) {
                yield this.spiderQueue.add('GrabQDBookChapters', {
                    bookName: name,
                });
            }
            return {
                bookEntity, bookChapters
            };
        });
    }
    readchapter(name, indexId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = `${process.cwd()}/runtime/books/${name}/${indexId}.md`;
            let data = "";
            if (fs.existsSync(filename)) {
                data = fs.readFileSync(filename, 'utf-8');
            }
            yield this.spiderQueue.add('ChapterPreGrab', {
                bookName: name,
                indexId,
            });
            return data;
        });
    }
    test(name, indexId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = `${process.cwd()}/runtime/books/${name}/${indexId}.md`;
            const data = fs.readFileSync(filename);
            return data.toString();
        });
    }
    bookReadSidebar(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(name);
            const res = `
        * [首页](zh-cn/)
        * [《之诸天万界》数字藏品预约开始啦！](大奉打更人/《之诸天万界》数字藏品预约开始啦！.md)
        * [第二章妖物作祟](大奉打更人/第二章 妖物作祟.md)
        `;
            return res;
        });
    }
    indexhome() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Description">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="/public/vendor/themes/vue.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'xiaix',
      repo: '',
      crossOriginLinks: [''],
      loadSidebar:true,
      basePath: 'http://127.0.0.1:3000',
      homepage: '/books/home',
      loadSidebar:"books/bookReadSidebar/%E5%A4%A7%E5%A5%89%E6%89%93%E6%9B%B4%E4%BA%BA"
    }
  </script>
  <script src="/public/vendor/docsify.js"></script>
</body>
</html>
        `;
            return res;
        });
    }
};
__decorate([
    (0, common_1.Post)("/newbook"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "newbook", null);
__decorate([
    (0, common_1.Get)("/"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "getBooks", null);
__decorate([
    (0, common_1.Get)("/reQueryBook/:name"),
    __param(0, (0, common_1.Param)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "reQueryBook", null);
__decorate([
    (0, common_1.Get)("/bookhome/:name"),
    __param(0, (0, common_1.Param)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "bookhome", null);
__decorate([
    (0, common_1.Get)("/readchapter/:name/:indexId"),
    __param(0, (0, common_1.Param)("name")),
    __param(1, (0, common_1.Param)("indexId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "readchapter", null);
__decorate([
    (0, common_1.Get)("/test/:name"),
    __param(0, (0, common_1.Param)("name")),
    __param(1, (0, common_1.Param)("indexId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "test", null);
__decorate([
    (0, common_1.Get)("/bookReadSidebar/:name"),
    __param(0, (0, common_1.Param)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "bookReadSidebar", null);
__decorate([
    (0, common_1.Get)("/index"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "indexhome", null);
BooksController = __decorate([
    (0, common_1.Controller)("books"),
    __param(2, (0, bull_1.InjectQueue)('SpiderQueue')),
    __metadata("design:paramtypes", [books_service_1.BooksService,
        spidermanager_service_1.SpiderManagerService, Object])
], BooksController);
exports.BooksController = BooksController;
//# sourceMappingURL=books.controller.js.map