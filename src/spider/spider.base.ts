import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from './spider.define';
import puppeteer = require('puppeteer');
import BrowserManager from './browser.manager';

/**
 * 爬虫工厂方法基类
 */
export abstract class BaseSpider {
    // public static puppeteerInstance;
    // public static pagePools:puppeteer.Page[] = [];
    siteKey: SpiderSite;
    // browser: puppeteer.Browser;
    // page: puppeteer.Page;
    readonly baseUrl: string;
    readonly queryUrl: string;

    async doInit() {
        // console.log(`BaseSpider doInit`);
    }

    /**
     * 获取一个Puppeteer的新页面
     * @returns Promise<puppeteer.Page>
     */
    async askPage(): Promise<puppeteer.Page> {
        return await BrowserManager.I().askPage()
    }

    async releasePage(page:puppeteer.Page) {
        await BrowserManager.I().releasePage(page);
    }

    /**
     * 查徇书籍
     * @param name 书籍名称
     */
    abstract queryBook(name: string): Promise<BookQueryVO|false>;
    /**
     * 爬取小说章节列表
     * @param name string;
     */
    abstract fetchBookChapters(indexPage: string): Promise<SpiderSiteBookChapterVO[]>;
    /**
     * 爬取小说章节详情
     * @param chapterURL string;
     */
    abstract fetchChapterDetail(chapterVO: SpiderSiteBookChapterVO): Promise<SpiderSiteBookChapterContentVO>;
}
