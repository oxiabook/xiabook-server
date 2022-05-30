import { BaseSpider } from '../spider.base';
// import cheerio = require('cheerio');
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from '../spider.define';
import * as _ from 'lodash'
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'

/**
 * 小说精品层爬虫实现
 *
 * @export
 * @class XSJPWSpider
 * @extends {BaseSpider}
 */
export class XSJPWSpider extends BaseSpider {
    baseUrl = 'http://47.106.243.172:8888/book/bookclass.html?k={book_name}';
    queryUrl = 'http://47.106.243.172:8888/book/bookclass.html?k={book_name}';
    siteKey = SpiderSite.XSJPW;

    async queryBook(name: string): Promise<BookQueryVO|false> {
        const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
        const page = await this.askPage();
        await page.goto(queryurl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#bookList');
        const bookInfo = await page.evaluate(() => {
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
            } catch (error) {
                return false;
            }
        });
        await this.releasePage(page);

        if (bookInfo) {
            bookInfo.siteKey = this.siteKey;
            if (bookInfo.bookName !== name) {
                return false;
            }
        }
        // console.log(`bookInfo:${JSON.stringify(bookInfo)}`);
        return bookInfo;
    }

    /**
     * 取得某书的章节列表
     * XBQG中章节有分页 先取分页再逐一取分页中的章节
     * @param indexPage
     */
    async fetchBookChapters(indexPage: string): Promise<any> {
        console.log(`fetchBookChapters:${indexPage}`);
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.dirList');
        const chapters = await page.evaluate(() => {
            const baseUrl = 'http://47.106.243.172:8888';
            const liaSel = 'body > div.main.box_center.cf > div.channelWrap.channelChapterlist.cf.mb50 > div > div.dirWrap.cf > div > ul > li > a';
            // const liaSel = 'body > div.main.box_center.cf > div.channelWrap.channelChapterlist.cf.mb50 > div > div.dirWrap.cf > div > ul > li';
            // const liaSel = '#list > dl > dd > a';
            const alist = document.querySelectorAll(liaSel);
            // console.log(`xxxx:${alist.length}`)
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
        await this.releasePage(page);
        for (const chapterVO of chapters) {
            chapterVO.title = chapterVO.title.replace("[免费]", "");
            chapterVO.title = _.trim(chapterVO.title)
            chapterVO.siteKey = this.siteKey
        }
        return chapters;
        // console.log(JSON.stringify(fullList))
    }

    /**
     * 获取章节祥情
     * @param chapterVO 
     * @returns 
     */
    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<any> {
        const page = await this.askPage();
        await page.goto(chapterVO.chapterURL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#readcontent');
        let chapterContent = await page.evaluate(() => {
            const contentSel = '#readcontent > div > div.txtwrap';
            const contentDom = document.querySelector(contentSel);
            // console.log(contentDom.textContent)
            return contentDom.innerHTML;
        });
        await this.releasePage(page);
        // console.log(`chapterContent1:${chapterContent}`);
        // chapterContent = chapterContent.replace("<br>", "\n")
        chapterContent =  NodeHtmlMarkdown.translate(
            /* html */ chapterContent, 
            /* options (optional) */ {}, 
            /* customTranslators (optional) */ undefined,
            /* customCodeBlockTranslators (optional) */ undefined
        );
        // console.log(`chapterContent2:${chapterContent}`);
        // console.log('chapterContent', chapterContent)
        const chapterContentVO = (chapterVO as SpiderSiteBookChapterContentVO);
        chapterContentVO.content = chapterContent
        return chapterContentVO;
    }
}
