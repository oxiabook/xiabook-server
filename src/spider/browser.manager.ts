import puppeteer = require('puppeteer');
import Utils from './Utils';
/**
 * 浏览器调度管理器
 */
export default class BrowserManager{
    public static I(){
        if (!BrowserManager._instance) {
            new BrowserManager();
        }
        return BrowserManager._instance;
    }

    public static _instance:BrowserManager;

    pagePools:puppeteer.Page[] = [];
    browser: puppeteer.Browser;
    isInited = false;

    constructor() {
        BrowserManager._instance = this;
    }

    public async doInit(headless = false){
        if (!this.browser) {
            const options = {
                headless,
            };
            this.browser = await puppeteer.launch(options);
            this.pagePools = [];
            for (let i = 0; i < 5; i++) {
                const page = await this.browser.newPage();
                this.pagePools.push(page);
            }
            this.isInited = true;
        }
        return this.browser;
    }

    /**
     * 获取一个Puppeteer的新页面
     * @returns Promise<puppeteer.Page>
     */
    async askPage(): Promise<puppeteer.Page> {
        for (let i = 0; i < 20; i++) {
            if(!this.isInited) {
                await Utils.sleep(1000);
                continue;
            }
            if (this.pagePools.length === 0) {
                await Utils.sleep(1000);
                continue;
            }
            const page = this.pagePools.pop();
            return page;
        }
    }
    /**
     * 将页面放回池里
     * @param page 
     */
    async releasePage(page:puppeteer.Page) {
        await page.goto("about:blank")
        this.pagePools.push(page);
    }
}