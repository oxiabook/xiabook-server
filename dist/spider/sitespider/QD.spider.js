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
exports.QDSpider = void 0;
const spider_base_1 = require("../spider.base");
const spider_define_1 = require("../spider.define");
const Utils_1 = require("../Utils");
class QDSpider extends spider_base_1.BaseSpider {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://www.qidian.com';
        this.queryUrl = 'https://www.qidian.com/soushu/{book_name}.html';
        this.siteKey = spider_define_1.SpiderSite.QD;
    }
    queryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`QD:queryBook:${name}`);
            const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
            const page = yield this.askPage();
            yield page.goto(queryurl, { waitUntil: 'networkidle2' });
            const bookInfo = yield page.evaluate(() => {
                const bookNameSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > h2 > a > cite';
                const authorSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > p.author > a.name';
                const statusSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > p.author > span';
                const bookHrefSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > h2 > a';
                const imgHrefSel = '#result-list > div > ul > li:nth-child(1) > div.book-img-box > a > img';
                const bookNameDom = document.querySelector(bookNameSel);
                const authorDom = document.querySelector(authorSel);
                const statusDom = document.querySelector(statusSel);
                const bookHrefDom = document.querySelector(bookHrefSel);
                const imgHrefDom = document.querySelector(imgHrefSel);
                return {
                    bookName: bookNameDom.textContent,
                    author: authorDom.textContent,
                    siteKey: 'QD',
                    status: statusDom.textContent,
                    bookimg: `https:${imgHrefDom.getAttribute('src')}`,
                    indexPage: `https:${bookHrefDom.getAttribute('href')}#Catalog`,
                };
            });
            bookInfo.siteKey = this.siteKey;
            bookInfo.indexPage = bookInfo.indexPage.replace('book.qidian.com/info/', 'm.qidian.com/book/');
            bookInfo.indexPage = bookInfo.indexPage.replace('#Catalog', 'catalog');
            console.log(`qd bookInfo:${JSON.stringify(bookInfo)}`);
            yield this.releasePage(page);
            return bookInfo;
        });
    }
    fetchBookChapters(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`QD.spider fetchBookChapters ${indexPage}`);
            return yield this.fetchBookChaptersFromMobile(indexPage);
            const page = yield this.askPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            const chapters = yield page.evaluate(() => {
                const liaSel = '.volume > ul > li > h2 > a';
                const alist = document.querySelectorAll(liaSel);
                const chapters = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const chapterVO = {
                        siteKey: 'QD',
                        index: i + 1,
                        title: alist[i].textContent,
                        chapterURL: alist[i].getAttribute('href'),
                    };
                    chapters.push(chapterVO);
                }
                return chapters;
            });
            yield this.releasePage(page);
            return chapters;
        });
    }
    fetchBookChaptersFromMobile(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`fetchBookChaptersFromMobile:${indexPage}`);
            const page = yield this.askPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle0' });
            const chapters = [];
            const titles = [];
            let lastLength = 0;
            for (let i = 1; i < 200; i++) {
                const items = yield page.evaluate((i) => {
                    const chapters = [];
                    window.scrollTo(0, i * 800);
                    const liaSel = '#volumes > li > h2 > a > span.chapter-index';
                    const alist = document.querySelectorAll(liaSel);
                    for (let i = 0; i <= alist.length - 1; i++) {
                        const title = alist[i].textContent;
                        const chapterVO = {
                            siteKey: 'QD',
                            index: i + 1,
                            title: title,
                            chapterURL: "",
                        };
                        chapters.push(chapterVO);
                    }
                    return chapters;
                }, i);
                for (const chapterVO of items) {
                    if (titles.indexOf(chapterVO.title) == -1) {
                        chapters.push(chapterVO);
                        titles.push(chapterVO.title);
                    }
                }
                if (lastLength === chapters.length) {
                    break;
                }
                lastLength = chapters.length;
                console.info(`滚动第${i}次 共抓取:${chapters.length}条`);
                yield Utils_1.default.sleep(200);
            }
            yield this.releasePage(page);
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
exports.QDSpider = QDSpider;
//# sourceMappingURL=QD.spider.js.map