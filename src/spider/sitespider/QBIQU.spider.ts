import { BaseSpider } from '../spider.base';
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from '../spider.define';
import puppeteer = require('puppeteer');
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
        const options = {
            headless:false,
        };
        const browser = await puppeteer.launch(options);
        let bookInfo;
        try {
            // const browser = await this.getPuppeteerBrowser();
            const page = await browser.newPage();
            // await page.emulate(devices['iPhone X'])
            await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            await page.waitForSelector('#wd');
            await page.type('#wd', name, { delay: 100 }); //自动在搜索框里慢慢输入书名 ,
            page.click('#sss'); //然后点击搜索
            // await page.waitFor(3000);
            await Utils.sleep(1000);
            const pages = await browser.pages();
            const newPage = pages[2];
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
            console.log(`xxxerror:${error}`);
            bookInfo = false;
        }
        if (bookInfo) {
            bookInfo.siteKey = this.siteKey;
        }
        await browser.close();
        return bookInfo;
    }

    // /**
    //  * 查徇书籍列表面的分页数
    //  * @param indexPage
    //  * @returns
    //  */
    // async fetchBookChapterPage(indexPage: string):Promise<any>{
    //     const page = await this.getPuppeteerPage(false);
    //     // await page.emulate(devices['iPhone X'])
    //     await page.goto(indexPage, { waitUntil: 'networkidle2' });
    //     await page.waitForSelector('#list');
    //     const pageNums = await page.evaluate(() => {
    //         const liSel = '#list > dl > dd > a'
    //         const alist = document.querySelectorAll(liSel);
    //         const pageNums = [];
    //         for (let i = 0; i <= alist.length - 1; i++) {
    //             const pageNum = alist[i].textContent;
    //             if (parseInt(pageNum).toString() != 'NaN') {
    //                 pageNums.push(pageNum)
    //             }
    //         }
    //         console.log(pageNums)
    //         return pageNums;
    //     });
    //     console.log(`chapterPage:${JSON.stringify(pageNums)}`);
    //     return pageNums;
    // }

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
                    siteKey: 'XBQG',
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

    // /**
    //  * 获取某页的章节列表
    //  * @param indexPage
    //  * @param pageNum
    //  * @returns
    //  */
    // async fetchPageChapters(indexPage: string): Promise<any> {
       
    // }

    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<SpiderSiteBookChapterContentVO> {
        // throw new Error('Method not implemented.');
        const chapterURL = `${this.baseUrl}${chapterVO.chapterURL}`;
        // console.log('fetchChapterDetail', chapterURL);
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(chapterURL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#content');
        const chapterContent = await page.evaluate(() => {
            const contentSel = '#content';
            const contentDom = document.querySelector(contentSel);
            // console.log(contentDom.textContent)
            return contentDom.textContent;
        });
        await this.releasePage(page);
        // console.log('chapterContent', chapterContent)
        const chapterContentVO = (chapterVO as SpiderSiteBookChapterContentVO);
        chapterContentVO.content = chapterContent
        return chapterContentVO;
    }
}
