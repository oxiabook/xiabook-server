import { BaseSpider } from '../spider.base';
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterVO } from '../spider.define';
import Utils from '../Utils';

/**
 * 起点小说爬取
 * 起点爬虫仅爬取小说信息和章节目录
 *
 * @export
 * @class XSJPWSpider
 * @extends {BaseSpider}
 */
export class QDSpider extends BaseSpider {
    baseUrl = 'https://www.qidian.com';
    queryUrl = 'https://www.qidian.com/soushu/{book_name}.html';
    siteKey = SpiderSite.QD;

    async queryBook(name: string): Promise<BookQueryVO> {
        console.log(`QD:queryBook:${name}`);
        const queryurl = encodeURI(this.queryUrl.replace('{book_name}', name));
        const page = await this.askPage();
        // const page = await this.getPuppeteerPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(queryurl, { waitUntil: 'networkidle2' });
        const bookInfo = await page.evaluate(() => {
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
        bookInfo.indexPage =  bookInfo.indexPage.replace('book.qidian.com/info/', 'm.qidian.com/book/')
        bookInfo.indexPage =  bookInfo.indexPage.replace('#Catalog', 'catalog')
        console.log(`qd bookInfo:${JSON.stringify(bookInfo)}`)
        await this.releasePage(page);
        return bookInfo;
    }
    /**
     * 拉取小说章节列表
     * @param indexPage
     * @returns
     */
    async fetchBookChapters(indexPage: string): Promise<SpiderSiteBookChapterVO[]> {
        // throw new Error('Method not implemented.');
        console.log(`QD.spider fetchBookChapters ${indexPage}`)
        return await this.fetchBookChaptersFromMobile(indexPage);
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle2' });
        const chapters = await page.evaluate(() => {
            const liaSel = '.volume > ul > li > h2 > a';
            const alist = document.querySelectorAll(liaSel);
            const chapters = [];
            // #j-catalogWrap > div.volume-wrap > div:nth-child(1) > ul > li:nth-child(1) > h2 > a
            for (let i = 0; i <= alist.length - 1; i++) {
                const chapterVO = {
                    siteKey:'QD',
                    index: i + 1,
                    title: alist[i].textContent,
                    chapterURL: alist[i].getAttribute('href'),
                };
                chapters.push(chapterVO);
            }
            return chapters;
        });
        await this.releasePage(page);
        // console.log(`chapters:${chapters}`);
        return chapters;
    }

    async fetchBookChaptersFromMobile(indexPage: string) {
        // console.log("fetchBookChaptersFromMobile")
        // https://book.qidian.com/info/1019664125/#Catalog
        // https://m.qidian.com/book/1021617576/catalog/
        // indexPage = indexPage.replace('book.qidian.com/info/', 'm.qidian.com/book/')
        // indexPage = indexPage.replace('#Catalog', 'catalog')
        console.log(`fetchBookChaptersFromMobile:${indexPage}`)
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle0' });
        const chapters = [];
        const titles = []
        let lastLength = 0;
        for (let i = 1; i < 200; i++) {
            // 滚动页面并获取章节
            const items = await page.evaluate((i) => {
                const chapters = [];
                window.scrollTo(0, i * 800);
                const liaSel = '#volumes > li > h2 > a > span.chapter-index'
                const alist = document.querySelectorAll(liaSel);
                // #j-catalogWrap > div.volume-wrap > div:nth-child(1) > ul > li:nth-child(1) > h2 > a
                for (let i = 0; i <= alist.length - 1; i++) {
                    const title = alist[i].textContent
                    const chapterVO = {
                        siteKey:'QD',
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
                    chapters.push(chapterVO)
                    titles.push(chapterVO.title)
                }
            }
            if (lastLength === chapters.length) {
                break;
            }
            lastLength = chapters.length;
            console.info(`滚动第${i}次 共抓取:${chapters.length}条`)
            await Utils.sleep(200)
        }
        await this.releasePage(page);
        // console.log(`chapters:${chapters}`);
        return chapters;
    }

    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<any> {
        // throw new Error('Method not implemented.');
        console.log(chapterVO);
        return;
    }
}
