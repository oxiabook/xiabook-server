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
exports.XBQGSpider = void 0;
const spider_base_1 = require("../spider.base");
class XBQGSpider extends spider_base_1.BaseSpider {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://www.buymabooks.com';
        this.queryUrl = 'https://www.buymabooks.com/search.html?keyword={book_name}';
    }
    queryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`QD:queryBook:${name}`);
            const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
            const page = yield this.getPuppeteerPage();
            yield page.goto(queryurl, { waitUntil: 'networkidle2' });
            const bookInfo = yield page.evaluate(() => {
                const thisurl = 'https://www.buymabooks.com';
                const bookNameSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dd > a';
                const authorSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dd > p:nth-child(2) > a:nth-child(1)';
                const bookHrefSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dd > a';
                const imgHrefSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dt > a > img';
                const bookNameDom = document.querySelector(bookNameSel);
                const authorDom = document.querySelector(authorSel);
                const bookHrefDom = document.querySelector(bookHrefSel);
                const imgHrefDom = document.querySelector(imgHrefSel);
                return {
                    bookName: bookNameDom.textContent,
                    author: authorDom.textContent,
                    siteKey: 'XBQG',
                    status: "",
                    bookimg: `${thisurl}${imgHrefDom.getAttribute('src')}`,
                    indexPage: `${thisurl}${bookHrefDom.getAttribute('href')}`,
                };
            });
            bookInfo.siteKey = this.siteKey;
            return bookInfo;
        });
    }
    fetchBookChapterPage(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.getPuppeteerPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('body > div.work_content.clearfixer > div > div.pages_bottom > ul');
            const pageNums = yield page.evaluate(() => {
                const liSel = 'body > div.work_content.clearfixer > div > div.pages_bottom > ul > li';
                const alist = document.querySelectorAll(liSel);
                const pageNums = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const pageNum = alist[i].textContent;
                    if (parseInt(pageNum).toString() != 'NaN') {
                        pageNums.push(pageNum);
                    }
                }
                console.log(pageNums);
                return pageNums;
            });
            console.log(`chapterPage:${JSON.stringify(pageNums)}`);
            return pageNums;
        });
    }
    fetchBookChapters(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageNums = yield this.fetchBookChapterPage(indexPage);
            let fullList = [];
            for (const pageNum of pageNums) {
                const chapters = yield this.fetchPageChapters(indexPage, pageNum);
                fullList = fullList.concat(chapters);
            }
            return fullList;
        });
    }
    fetchPageChapters(indexPage, pageNum) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(indexPage);
            indexPage += `?chapter_page=${pageNum}`;
            const page = yield this.getPuppeteerPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('div.chapter-list-all.chapter-list');
            const chapters = yield page.evaluate(() => {
                const liaSel = 'div.chapter-list-all.chapter-list > dl > dd > a';
                const alist = document.querySelectorAll(liaSel);
                const chapters = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const chapterVO = {
                        siteKey: 'XBQG',
                        index: i + 1,
                        title: alist[i].textContent,
                        chapterURL: alist[i].getAttribute('href'),
                    };
                    chapters.push(chapterVO);
                }
                return chapters;
            });
            console.log(`XBQG分页取数:第${pageNum}页 共${chapters.length}`);
            return chapters;
        });
    }
    fetchChapterDetail(chapterVO) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(chapterVO);
            return;
        });
    }
}
exports.XBQGSpider = XBQGSpider;
//# sourceMappingURL=XBQG.spider.js.map