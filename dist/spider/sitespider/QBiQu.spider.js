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
exports.QBIQUSpider = void 0;
const spider_base_1 = require("../spider.base");
const spider_define_1 = require("../spider.define");
const Utils_1 = require("../Utils");
class QBIQUSpider extends spider_base_1.BaseSpider {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://www.qbiqu.com/';
        this.queryUrl = 'https://www.qbiqu.com//modules/article/search.php?searchkey={book_name}';
        this.siteKey = spider_define_1.SpiderSite.QBIQU;
    }
    queryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`QBIQUSpider:queryBook:${name}`);
            let bookInfo;
            let page;
            let newPage;
            try {
                const browser = yield this.getBrowser();
                const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
                page = yield this.askPage();
                yield page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
                yield page.waitForSelector('#wd');
                yield page.type('#wd', name, { delay: 100 });
                yield page.click('#sss');
                newPage = (yield newPagePromise);
                yield Utils_1.default.sleep(3000);
                yield newPage.waitForSelector('#wrapper');
                bookInfo = yield newPage.evaluate(() => {
                    try {
                        const thisurl = 'https://www.qbiqu.com';
                        const bookNameSel = '#info > h1';
                        const authorSel = '#info > p:nth-child(2)';
                        const bookHrefSel = '#intro > p:nth-child(2) > a';
                        const imgHrefSel = '#fmimg > img';
                        const bookNameDom = document.querySelector(bookNameSel);
                        const authorDom = document.querySelector(authorSel);
                        const bookHrefDom = document.querySelector(bookHrefSel);
                        const imgHrefDom = document.querySelector(imgHrefSel);
                        return {
                            bookName: bookNameDom.textContent,
                            author: authorDom.textContent,
                            siteKey: 'QBIQU',
                            status: '',
                            bookimg: `${thisurl}${imgHrefDom.getAttribute('src')}`,
                            indexPage: `${bookHrefDom.getAttribute('href')}`,
                        };
                    }
                    catch (error) {
                        return false;
                    }
                });
            }
            catch (error) {
                bookInfo = false;
            }
            if (bookInfo) {
                bookInfo.siteKey = this.siteKey;
            }
            if (newPage) {
                console.log(`newPage:close`);
                if (!newPage.isClosed()) {
                    yield newPage.close();
                }
            }
            yield this.releasePage(page);
            return bookInfo;
        });
    }
    fetchBookChapters(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`fetchBookChapters:${indexPage}`);
            const page = yield this.askPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#list');
            const chapters = yield page.evaluate(() => {
                const liaSel = '#list > dl > dd > a';
                const alist = document.querySelectorAll(liaSel);
                const chapters = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const chapterVO = {
                        siteKey: 'QBIQU',
                        index: i + 1,
                        title: alist[i].textContent,
                        chapterURL: alist[i].getAttribute('href'),
                    };
                    chapters.push(chapterVO);
                }
                console.log(`xxxx:${JSON.stringify(chapters)}`);
                return chapters;
            });
            yield this.releasePage(page);
            console.log(`XBQG分页取数:共${chapters.length}`);
            return chapters;
        });
    }
    fetchChapterDetail(chapterVO) {
        return __awaiter(this, void 0, void 0, function* () {
            const chapterURL = `${this.baseUrl}${chapterVO.chapterURL}`;
            const page = yield this.askPage();
            yield page.goto(chapterURL, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#content');
            const chapterContent = yield page.evaluate(() => {
                const contentSel = '#content';
                const contentDom = document.querySelector(contentSel);
                return contentDom.textContent;
            });
            yield this.releasePage(page);
            const chapterContentVO = chapterVO;
            chapterContentVO.content = chapterContent;
            return chapterContentVO;
        });
    }
}
exports.QBIQUSpider = QBIQUSpider;
//# sourceMappingURL=QBIQU.spider.js.map