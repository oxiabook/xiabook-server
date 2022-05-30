import { BaseSpider } from '../spider.base';
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from '../spider.define';
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'

/**
 * HaoTxt8Spider
 *
 * @export
 * @class HaoTxt8Spider
 * @extends {BaseSpider}
 */
export class HaoTxt8Spider extends BaseSpider {
    baseUrl = 'https://www.haotxt8.com/';
    queryUrl = 'https://www.haotxt8.com/search/?searchkey={bookName}';
    siteKey = SpiderSite.HAOTXT8;

    async queryBook(name: string): Promise<BookQueryVO|false> {
        console.log(`HaoTxt8:queryBook:${name}`);
        const queryurl = encodeURI(this.queryUrl.replace('{bookName}', name));
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(queryurl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.container');
        try {
            const bookInfo = await page.evaluate(() => {
                try {
                    const thisurl = 'https://www.haotxt8.com';
                    const bookNameSel = 'body > div.container > div > table > tbody > tr > td:nth-child(2) > a';
                    const authorSel = 'body > div.container > div > table > tbody > tr > td:nth-child(3)';
                    // const statusSel = '#result-list > div > ul > li:nth-child(1) > div.book-mid-info > p.author > span';
                    const bookHrefSel = 'body > div.container > div > table > tbody > tr > td:nth-child(2) > a';
                    // const imgHrefSel = '';
                    const bookNameDom = document.querySelector(bookNameSel);
                    const authorDom = document.querySelector(authorSel);
                    // const statusDom = document.querySelector(statusSel);
                    const bookHrefDom = document.querySelector(bookHrefSel);
                    // const imgHrefDom = document.querySelector(imgHrefSel);
                    return {
                        bookName: bookNameDom.textContent,
                        author: authorDom.textContent,
                        siteKey: 'HAOTXT8',
                        status: "",
                        bookimg: ``,
                        indexPage: `${thisurl}${bookHrefDom.getAttribute('href')}`,
                    };
                } catch (error) {
                    return false;
                }
               
            });
            if (bookInfo) {
                bookInfo.siteKey = this.siteKey;
            }
            await this.releasePage(page);
            return bookInfo;
        } catch (error) {
            console.log(`xxxx:${error}`)
            return false;
        }
    }

    /**
     * 查徇书籍列表面的分页数
     * @param indexPage 
     * @returns 
     */
    async fetchBookChapters(indexPage: string):Promise<any>{
        console.log(`fetchBookChapters:${indexPage}`);
        const page = await this.askPage();
        // await page.emulate(devices['iPhone X'])
        await page.goto(indexPage, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#list');
        const chapters = await page.evaluate(() => {
            const baseUrl = 'https://www.haotxt8.com'
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
            // console.log(`xxxx:${JSON.stringify(chapters)}`);
            return chapters;
        });
        console.log(`chapters:${JSON.stringify(chapters)}`);
        await this.releasePage(page)
        return chapters;
    }

    async fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<any> {
        const page = await this.askPage();
        await page.goto(chapterVO.chapterURL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#content');
        let chapterContent = await page.evaluate(() => {
            const contentSel = '#content';
            const contentDom = document.querySelector(contentSel);
            // console.log(contentDom.textContent)
            return contentDom.innerHTML;
        });
        chapterContent =  NodeHtmlMarkdown.translate(
            /* html */ chapterContent, 
            /* options (optional) */ {}, 
            /* customTranslators (optional) */ undefined,
            /* customCodeBlockTranslators (optional) */ undefined
        );
        // console.log('chapterContent', chapterContent)
        const chapterContentVO = (chapterVO as SpiderSiteBookChapterContentVO);
        chapterContentVO.content = chapterContent
        await this.releasePage(page);
        return chapterContentVO;
    }
}
