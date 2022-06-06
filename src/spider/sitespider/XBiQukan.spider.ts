import { BaseSpider } from '../spider.base';
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from '../spider.define';
import Utils from '../Utils';

/**
 * www.xbiqukan.com爬虫实现
 *
 * @export
 * @class XBiQukanSpider
 * @extends {BaseSpider}
 */
export class XBiQukanSpider extends BaseSpider {
    baseUrl = 'https://www.xbiqukan.com';
    siteKey = SpiderSite.XBIQUKAN;

    async queryBook(name: string): Promise<BookQueryVO|false> {
        console.log(`XBIQUKAN:queryBook:${name}`);
        const page = await this.askPage();
        await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#wrapper');
        await page.type('#keyword', name, { delay: 100 }); //自动在搜索框里慢慢输入书名 ,
        page.click('#wrapper > div.header > div.search > form > span > input'); //然后点击搜索
        await Utils.sleep(3000)
        let bookInfo;
        try {
            bookInfo = await page.evaluate(() => {
                try {
                    const thisurl = 'https://www.xbiqukan.com/';
                    const bookNameSel = '#info > h1';
                    const authorSel = '#info > p:nth-child(2)';
                    // const statusSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > p.author > span';
                    const bookHrefSel = '#footer > div.footer_cont > p:nth-child(1) > a';
                    const imgHrefSel = '#fmimg > img';
                    const bookNameDom = document.querySelector(bookNameSel);
                    const authorDom = document.querySelector(authorSel);
                    // const statusDom = document.querySelector(statusSel);
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
                } catch (error) {
                    return false;
                }
            });
            if (bookInfo) {
                bookInfo.siteKey = this.siteKey;
            }
        } catch (error) {
            bookInfo = false;
        }
        // await page.waitForSelector('#maininfo');
        await Utils.sleep(1000);
        await this.releasePage(page);

        console.log(`bookInfo:${JSON.stringify(bookInfo)}`);
        return bookInfo;
    }

    /**
     * 取得某书的章节列表
     * XBQG中章节有分页 先取分页再逐一取分页中的章节
     * @param indexPage 
     */
    async fetchBookChapters(indexPage: string): Promise<any> {
        console.log(indexPage);
        // indexPage += `?chapter_page=${pageNum}`
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#list');
        const chapters = await page.evaluate(() => {
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
            // console.log(`xxxx:${JSON.stringify(chapters)}`);
            return chapters;
        });
        await this.releasePage(page);
        console.log(`XBQG分页取数:共${chapters.length}`);
        return chapters;
    }

    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<any> {
        console.log(`fetchChapterDetail`)
        let chapterContent = ""
        let page;
        try {
            page = await this.askPage();
            await page.goto(chapterVO.chapterURL, { waitUntil: 'networkidle2' });
            // await page.waitForSelector('#content');
            await Utils.sleep(3000);
            chapterContent = await page.evaluate(() => {
                const contentSel = '#content';
                const contentDom = document.querySelector(contentSel);
                // console.log(contentDom.textContent)
                return contentDom.textContent;
            });
        } catch (error) {
            chapterContent = ""
            console.error(error)
        }
 
        // console.log('chapterContent', chapterContent)
        const chapterContentVO = (chapterVO as SpiderSiteBookChapterContentVO);
        chapterContentVO.content = chapterContent
        await this.releasePage(page);
        return chapterContentVO;
    }
}
