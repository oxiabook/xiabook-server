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
exports.HaoTxt8Spider = void 0;
const spider_base_1 = require("../spider.base");
const spider_define_1 = require("../spider.define");
const node_html_markdown_1 = require("node-html-markdown");
class HaoTxt8Spider extends spider_base_1.BaseSpider {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://www.haotxt8.com/';
        this.queryUrl = 'https://www.haotxt8.com/search/?searchkey={bookName}';
        this.siteKey = spider_define_1.SpiderSite.HAOTXT8;
    }
    queryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`HaoTxt8:queryBook:${name}`);
            const queryurl = encodeURI(this.queryUrl.replace('{bookName}', name));
            const page = yield this.askPage();
            yield page.goto(queryurl, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('.container');
            try {
                const bookInfo = yield page.evaluate(() => {
                    try {
                        const thisurl = 'https://www.haotxt8.com';
                        const bookNameSel = 'body > div.container > div > table > tbody > tr > td:nth-child(2) > a';
                        const authorSel = 'body > div.container > div > table > tbody > tr > td:nth-child(3)';
                        const bookHrefSel = 'body > div.container > div > table > tbody > tr > td:nth-child(2) > a';
                        const bookNameDom = document.querySelector(bookNameSel);
                        const authorDom = document.querySelector(authorSel);
                        const bookHrefDom = document.querySelector(bookHrefSel);
                        return {
                            bookName: bookNameDom.textContent,
                            author: authorDom.textContent,
                            siteKey: 'HAOTXT8',
                            status: "",
                            bookimg: ``,
                            indexPage: `${thisurl}${bookHrefDom.getAttribute('href')}`,
                        };
                    }
                    catch (error) {
                        return false;
                    }
                });
                if (bookInfo) {
                    bookInfo.siteKey = this.siteKey;
                }
                yield this.releasePage(page);
                return bookInfo;
            }
            catch (error) {
                console.log(`xxxx:${error}`);
                return false;
            }
        });
    }
    fetchBookChapters(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`fetchBookChapters:${indexPage}`);
            const page = yield this.askPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#list');
            const chapters = yield page.evaluate(() => {
                const baseUrl = 'https://www.haotxt8.com';
                const liaSel = '#list > dl > dd > a';
                const alist = document.querySelectorAll(liaSel);
                const chapters = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const chapterVO = {
                        siteKey: 'HAOTXT8',
                        index: i + 1,
                        title: alist[i].textContent,
                        chapterURL: `${baseUrl}${alist[i].getAttribute('href')}`,
                    };
                    chapters.push(chapterVO);
                }
                return chapters;
            });
            console.log(`chapters:${JSON.stringify(chapters)}`);
            yield this.releasePage(page);
            return chapters;
        });
    }
    fetchChapterDetail(chapterVO) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.askPage();
            yield page.goto(chapterVO.chapterURL, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#content');
            let chapterContent = yield page.evaluate(() => {
                const contentSel = '#content';
                const contentDom = document.querySelector(contentSel);
                return contentDom.innerHTML;
            });
            chapterContent = node_html_markdown_1.NodeHtmlMarkdown.translate(chapterContent, {}, undefined, undefined);
            const chapterContentVO = chapterVO;
            chapterContentVO.content = chapterContent;
            yield this.releasePage(page);
            return chapterContentVO;
        });
    }
}
exports.HaoTxt8Spider = HaoTxt8Spider;
//# sourceMappingURL=HaoTxt8.spider.js.map