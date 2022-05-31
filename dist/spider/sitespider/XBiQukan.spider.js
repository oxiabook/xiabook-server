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
exports.XBiQukanSpider = void 0;
const spider_base_1 = require("../spider.base");
const spider_define_1 = require("../spider.define");
const Utils_1 = require("../Utils");
class XBiQukanSpider extends spider_base_1.BaseSpider {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://www.xbiqukan.com';
        this.siteKey = spider_define_1.SpiderSite.XBIQUKAN;
    }
    queryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`XBIQUKAN:queryBook:${name}`);
            const page = yield this.askPage();
            yield page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#wrapper');
            yield page.type('#keyword', name, { delay: 100 });
            page.click('#wrapper > div.header > div.search > form > span > input');
            yield Utils_1.default.sleep(3000);
            let bookInfo;
            try {
                bookInfo = yield page.evaluate(() => {
                    try {
                        const thisurl = 'https://www.xbiqukan.com/';
                        const bookNameSel = '#info > h1';
                        const authorSel = '#info > p:nth-child(2)';
                        const bookHrefSel = '#footer > div.footer_cont > p:nth-child(1) > a';
                        const imgHrefSel = '#fmimg > img';
                        const bookNameDom = document.querySelector(bookNameSel);
                        const authorDom = document.querySelector(authorSel);
                        const bookHrefDom = document.querySelector(bookHrefSel);
                        const imgHrefDom = document.querySelector(imgHrefSel);
                        return {
                            bookName: bookNameDom.textContent,
                            author: authorDom.textContent,
                            siteKey: 'XBIQUKAN',
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
            yield Utils_1.default.sleep(1000);
            yield this.releasePage(page);
            if (bookInfo) {
                bookInfo.siteKey = this.siteKey;
            }
            console.log(`bookInfo:${JSON.stringify(bookInfo)}`);
            return bookInfo;
        });
    }
    fetchBookChapters(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(indexPage);
            const page = yield this.askPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#list');
            const chapters = yield page.evaluate(() => {
                const baseUrl = 'https://www.xbiqukan.com';
                const liaSel = '#list > dl > dd > a';
                const alist = document.querySelectorAll(liaSel);
                const chapters = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const chapterVO = {
                        siteKey: 'XBIQUKAN',
                        index: i + 1,
                        title: alist[i].textContent,
                        chapterURL: `${baseUrl}${alist[i].getAttribute('href')}`,
                    };
                    chapters.push(chapterVO);
                }
                return chapters;
            });
            yield this.releasePage(page);
            console.log(`XBQG分页取数:共${chapters.length}`);
            return chapters;
        });
    }
    fetchChapterDetail(chapterVO) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.askPage();
            yield page.goto(chapterVO.chapterURL, { waitUntil: 'networkidle2' });
            yield Utils_1.default.sleep(3000);
            const chapterContent = yield page.evaluate(() => {
                const contentSel = '#content';
                const contentDom = document.querySelector(contentSel);
                return contentDom.textContent;
            });
            const chapterContentVO = chapterVO;
            chapterContentVO.content = chapterContent;
            yield this.releasePage(page);
            return chapterContentVO;
        });
    }
}
exports.XBiQukanSpider = XBiQukanSpider;
//# sourceMappingURL=XBiQukan.spider.js.map