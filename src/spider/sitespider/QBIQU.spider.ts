import { BaseSpider } from '../spider.base';
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from '../spider.define';
import puppeteer = require('puppeteer-core');
import Utils from '../Utils';

/**
 * 新笔趣阁爬虫实现
 *
 * @export
 * @class XBQGSpider
 * @extends {BaseSpider}
 */
export class QBIQUSpider extends BaseSpider {
    baseUrl = 'https://www.qbiqu.com/';
    queryUrl = 'https://www.qbiqu.com//modules/article/search.php?searchkey={book_name}';
    siteKey = SpiderSite.QBIQU;
    async queryBook(name: string): Promise<BookQueryVO|false> {
        console.log(`QBIQUSpider:queryBook:${name}`);
        // const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
        let bookInfo;
        let page;
        let newPage;
        try {
            const browser = await this.getBrowser()
            const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));//创建newPagePromise对象
            page  = await this.askPage();
            await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await page.waitForSelector('#wd');
            await page.type('#wd', name, { delay: 100 }); //自动在搜索框里慢慢输入书名 ,
            await page.click('#sss'); //然后点击搜索 qbiqu会弹出新页面
            newPage = await newPagePromise as puppeteer.Page;//声明一个newPage对象
            await Utils.sleep(3000);
            // const pageReg = new RegExp("([0-9]{2})_([0-9]{5})");
            // newPage = await this.pickSpecPageByUrl("https://www.qbiqu.com/", pageReg)
            await newPage.waitForSelector('#wrapper');

            bookInfo = await newPage.evaluate(() => {
                try {
                    const thisurl = 'https://www.qbiqu.com';
                    const bookNameSel = '#info > h1';
                    const authorSel = '#info > p:nth-child(2)';
                    // const statusSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > p.author > span';
                    const bookHrefSel = '#intro > p:nth-child(2) > a';
                    const imgHrefSel = '#fmimg > img';
                    const bookNameDom = document.querySelector(bookNameSel);
                    const authorDom = document.querySelector(authorSel);
                    // const statusDom = document.querySelector(statusSel);
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
                } catch (error) {
                    return false;
                }
            });
        } catch (error) {
            bookInfo = false;
        }
        if (bookInfo) {
            bookInfo.siteKey = this.siteKey;
        }
        if (newPage) {
            console.log(`newPage:close`)
            if (!newPage.isClosed()) {
                await newPage.close();
            }
        }
        await this.releasePage(page);
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
        await page.waitForSelector('#list');
        const chapters = await page.evaluate(() => {
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
        await this.releasePage(page);
        console.log(`XBQG分页取数:共${chapters.length}`);
        return chapters;
    }

    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<SpiderSiteBookChapterContentVO> {
        const chapterURL = `${this.baseUrl}${chapterVO.chapterURL}`;
        const page = await this.askPage();
        await page.goto(chapterURL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#content');
        const chapterContent = await page.evaluate(() => {
            const contentSel = '#content';
            const contentDom = document.querySelector(contentSel);
            return contentDom.textContent;
        });
        await this.releasePage(page);
        const chapterContentVO = (chapterVO as SpiderSiteBookChapterContentVO);
        chapterContentVO.content = chapterContent
        return chapterContentVO;
    }
}
