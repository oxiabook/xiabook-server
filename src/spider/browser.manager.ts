import puppeteer = require('puppeteer-core');
import Utils from './Utils';
const _ = require('lodash')
import * as moment from 'moment';
import { Inject, Injectable } from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

/**
 * 浏览器调度管理器
 */
@Injectable()
export default class BrowserManager{
    public static I(){
        if (!BrowserManager._instance) {
            // new BrowserManager();
            throw("dont have BrowserManager instance")
        }
        return BrowserManager._instance;
    }

    public static _instance:BrowserManager;

    pagePools:puppeteer.Page[] = [];
    browser: puppeteer.Browser;
    isInited = false;
    /**
     *吏用中的页面索引
     *
     * @memberof BrowserManager
     */
    pageInUse = {};

    // constructor(private  configService:ConfigService) {
    //     BrowserManager._instance = this;
    // }
    
    constructor(    
        private  configService:ConfigService
    ) {
        // if (BrowserManager._instance) return BrowserManager._instance;
        console.log('browser init')
        const puppeteerConfig = this.configService.get("PUPPETEER")
        console.log(`puppeteerConfig:${JSON.stringify(puppeteerConfig)}`)
        BrowserManager._instance = this;
    }

    public async getBrowser(){
        return this.browser;
    }

    public async doInit(headless = false){
        const puppeteerConfig = this.configService.get("PUPPETEER")

        if (!this.browser) {
            for (let i = 0; i < 100; i++) {
                try {
                    const options = {
                        headless,
                    };
                    this.browser = await puppeteer.connect({
                        browserWSEndpoint: `ws://${puppeteerConfig.host}:${puppeteerConfig.port}`,
                        ignoreHTTPSErrors: true
                    });
                    await this.initPagePool();
                    this.isInited = true;
                    console.warn(`已连接到puppeteer`)
                    break;
                } catch (error) {
                    console.log(`连接puppeteer发生异常:${error.message}, 1秒后将重试!`)
                    await Utils.sleep(1000);
                }
            }
            // console.error("puppeteer连接失败!将不能抓取新章节!")
        }
        return this.browser;
    }

    private async initPagePool(){
        this.pagePools = [];
        const pages = await this.browser.pages();
        const waitpages = 10;
        for (let i = 0; i < (waitpages - pages.length); i++) {
            const page = await this.browser.newPage();
        }
        this.pagePools = pages;
    }

    /**
     * 获取一个Puppeteer的新页面
     * @returns Promise<puppeteer.Page>
     */
    async askPage(tag: any = ""): Promise<puppeteer.Page> {
        for (let i = 0; i < 20; i++) {
            if(!this.isInited) {
                await Utils.sleep(1000);
                continue;
            }
            const page = this.pagePools.shift();
            if (page) {
                return page;
            } else {
                await Utils.sleep(1000);
            }
        }
    }
    
    async pickSpecPageByUrl(urlPrefix: string, urlReg:RegExp) {
        for (let i = 0; i < 10; i++) {
            const pages = await this.browser.pages();
            for (const page of pages) {
                const url = page.url()
                if (_.startsWith(url, urlPrefix)) {
                    const is = urlReg.test(url)
                    // console.log(url, urlPrefix, urlReg, is);
                    if (urlReg.test(url)) {
                        return page;
                    }
                }
            }
            await Utils.sleep(1000);
        }
        return false;
    }

    /**
     * 将页面放回池里
     * @param page 
     */
    async releasePage(page:puppeteer.Page) {
        try {
            await page.goto("about:blank");
            this.pagePools.push(page);
        } catch (error) {
            console.warn(error)
        }
    }
}