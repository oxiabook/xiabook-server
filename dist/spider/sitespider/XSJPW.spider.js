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
exports.XSJPWSpider = void 0;
const spider_base_1 = require("../spider.base");
const spider_define_1 = require("../spider.define");
const _ = require("lodash");
const node_html_markdown_1 = require("node-html-markdown");
const Utils_1 = require("../Utils");
class XSJPWSpider extends spider_base_1.BaseSpider {
    constructor() {
        super(...arguments);
        this.baseUrl = 'http://47.106.243.172:8888/book/bookclass.html?k={book_name}';
        this.queryUrl = 'http://47.106.243.172:8888/book/bookclass.html?k={book_name}';
        this.siteKey = spider_define_1.SpiderSite.XSJPW;
    }
    queryBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
            const page = yield this.askPage();
            yield page.goto(queryurl, { waitUntil: 'networkidle2' });
            yield page.waitForSelector('#bookList');
            const bookInfo = yield page.evaluate(() => {
                try {
                    const baseUrl = 'http://47.106.243.172:8888';
                    const bookNameSel = '#bookList > tr > td.name > a';
                    const authorSel = '#bookList > tr > td.author > a';
                    const bookNameDom = document.querySelector(bookNameSel);
                    const authorDom = document.querySelector(authorSel);
                    const thehref = bookNameDom.getAttribute('href');
                    const indexUrl = thehref.replace('/book/', '/book/indexList-');
                    return {
                        bookName: bookNameDom.textContent,
                        author: authorDom.textContent,
                        siteKey: 'XSJPW',
                        status: '',
                        bookimg: ``,
                        indexPage: `${baseUrl}${indexUrl}`,
                    };
                }
                catch (error) {
                    return false;
                }
            });
            yield this.releasePage(page);
            if (bookInfo) {
                bookInfo.siteKey = this.siteKey;
                if (bookInfo.bookName !== name) {
                    return false;
                }
            }
            return bookInfo;
        });
    }
    fetchBookChapters(indexPage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`fetchBookChapters:${indexPage}`);
            const page = yield this.askPage();
            yield page.goto(indexPage, { waitUntil: 'networkidle2' });
            yield Utils_1.default.sleep(3000);
            const chapters = yield page.evaluate(() => {
                const baseUrl = 'http://47.106.243.172:8888';
                const liaSel = 'body > div.main.box_center.cf > div.channelWrap.channelChapterlist.cf.mb50 > div > div.dirWrap.cf > div > ul > li > a';
                const alist = document.querySelectorAll(liaSel);
                const chapters = [];
                for (let i = 0; i <= alist.length - 1; i++) {
                    const chapterVO = {
                        siteKey: 'XSJPW',
                        index: i + 1,
                        title: alist[i].textContent,
                        chapterURL: `${baseUrl}${alist[i].getAttribute('href')}`,
                    };
                    chapters.push(chapterVO);
                }
                return chapters;
            });
            yield this.releasePage(page);
            for (const chapterVO of chapters) {
                chapterVO.title = chapterVO.title.replace("[??????]", "");
                chapterVO.title = _.trim(chapterVO.title);
                chapterVO.siteKey = this.siteKey;
            }
            return chapters;
        });
    }
    fetchChapterDetail(chapterVO) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`xsjpw fetchChapterDetail 1 ${chapterVO.indexId}`);
            const page = yield this.askPage(chapterVO.indexId);
            console.log(typeof (page));
            console.log(`xsjpw fetchChapterDetail 2 ${chapterVO.indexId}`);
            yield page.goto(chapterVO.chapterURL, { waitUntil: 'networkidle2' });
            console.log(`xsjpw fetchChapterDetail 3 ${chapterVO.indexId}`);
            yield page.waitForSelector('#readcontent');
            console.log(`xsjpw fetchChapterDetail 4 ${chapterVO.indexId}`);
            let chapterContent = yield page.evaluate(() => {
                const contentSel = '#readcontent > div > div.txtwrap';
                const contentDom = document.querySelector(contentSel);
                return contentDom.innerHTML;
            });
            console.log(`xsjpw fetchChapterDetail 5 ${chapterVO.indexId}`);
            yield this.releasePage(page);
            chapterContent = node_html_markdown_1.NodeHtmlMarkdown.translate(chapterContent, {}, undefined, undefined);
            const chapterContentVO = chapterVO;
            chapterContentVO.content = chapterContent;
            return chapterContentVO;
        });
    }
}
exports.XSJPWSpider = XSJPWSpider;
//# sourceMappingURL=XSJPW.spider.js.map