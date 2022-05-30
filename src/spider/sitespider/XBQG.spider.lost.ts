import { BaseSpider } from '../spider.base';
import { BookQueryVO, SpiderSiteBookChapterVO } from '../spider.define';

/**
 * 新笔趣阁爬虫实现
 * 站点已失效
 * @export
 * @class XBQGSpider
 * @extends {BaseSpider}
 */
export class XBQGSpider extends BaseSpider {
    baseUrl = 'https://www.buymabooks.com';
    queryUrl = 'https://www.buymabooks.com/search.html?keyword={book_name}';
    async queryBook(name: string): Promise<BookQueryVO> {
        console.log(`QD:queryBook:${name}`);
        const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(queryurl, { waitUntil: 'networkidle2' });
        const bookInfo = await page.evaluate(() => {
            const thisurl = 'https://www.buymabooks.com';
            const bookNameSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dd > a';
            const authorSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dd > p:nth-child(2) > a:nth-child(1)';
            // const statusSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > p.author > span';
            const bookHrefSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dd > a';
            const imgHrefSel = 'body > div.body-bg > div > div.wrap1200.ranklist > div.right-cont-box.fl.rankdata > div.rankdatacont.search > div.secd-rank-list > dl > dt > a > img';
            const bookNameDom = document.querySelector(bookNameSel);
            const authorDom = document.querySelector(authorSel);
            // const statusDom = document.querySelector(statusSel);
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
        await this.releasePage(page);
        bookInfo.siteKey = this.siteKey;
        return bookInfo;
    }

    /**
     * 查徇书籍列表面的分页数
     * @param indexPage 
     * @returns 
     */
    async fetchBookChapterPage(indexPage: string):Promise<any>{
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle2' });
        await page.waitForSelector('body > div.work_content.clearfixer > div > div.pages_bottom > ul');
        const pageNums = await page.evaluate(() => {
            const liSel = 'body > div.work_content.clearfixer > div > div.pages_bottom > ul > li'
            const alist = document.querySelectorAll(liSel);
            const pageNums = [];
            for (let i = 0; i <= alist.length - 1; i++) {
                const pageNum = alist[i].textContent;
                if (parseInt(pageNum).toString() != 'NaN') {
                    pageNums.push(pageNum)
                }
            }
            console.log(pageNums)
            return pageNums;
        });
        await this.releasePage(page);
        console.log(`chapterPage:${JSON.stringify(pageNums)}`);
        return pageNums;
    }

    /**
     * 取得某书的章节列表
     * XBQG中章节有分页 先取分页再逐一取分页中的章节
     * @param indexPage 
     */
    async fetchBookChapters(indexPage: string): Promise<any> {
        const pageNums = await this.fetchBookChapterPage(indexPage);
        let fullList = [];
        for (const pageNum of pageNums) {
            const chapters = await this.fetchPageChapters(indexPage, pageNum);
            fullList = fullList.concat(chapters)
        }
        return fullList;
        // console.log(fullList.length)
        // console.log(JSON.stringify(fullList))
    }

    /**
     * 获取某页的章节列表
     * @param indexPage 
     * @param pageNum 
     * @returns 
     */
    async fetchPageChapters(indexPage:string, pageNum: number): Promise<any> {
        console.log(indexPage);
        indexPage += `?chapter_page=${pageNum}`
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle2' });
        await page.waitForSelector('div.chapter-list-all.chapter-list');
        const chapters = await page.evaluate(() => {
            // const liaSel = '.volume > ul > li > h2 > a';
            const liaSel = 'div.chapter-list-all.chapter-list > dl > dd > a'
            const alist = document.querySelectorAll(liaSel);
            // console.log(`xxxx:${alist.length}`)
            const chapters = [];
            for (let i = 0; i <= alist.length - 1; i++) {
                const chapterVO = {
                    siteKey:'XBQG',
                    index: i + 1,
                    title: alist[i].textContent,
                    chapterURL: alist[i].getAttribute('href'),
                };
                chapters.push(chapterVO);
            }
            // console.log(`xxxx:${JSON.stringify(chapters)}`);
            return chapters;
        });
        await this.releasePage(page);
        console.log(`XBQG分页取数:第${pageNum}页 共${chapters.length}`);
        return chapters;
    }

    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<any> {
        // throw new Error('Method not implemented.');
        console.log(chapterVO);
        return;
    }
}
