import { Controller, Get, Param } from '@nestjs/common';
import { SpiderSite } from './spider.define';
import { SpiderFactory } from './spider.fatrory';
import { SpiderManagerService } from './spidermanager.service';
import Utils from './Utils';
import * as fs from 'fs'

@Controller('spider')
export class SpiderController {
    constructor(private readonly spiderManager: SpiderManagerService) {}

    @Get('/newbook/:name')
    async newbook(@Param('name') name: string): Promise<string> {
        console.log('controller newBook');
        await this.spiderManager.queryBookSites(name);
        return 'ok';
    }

    @Get('/testSpider/:bookname')
    async testSpider(@Param('bookname') bookname: string): Promise<string> {
        const spider = await SpiderFactory.createSpider(SpiderSite.XBIQUKAN);
        const bookQueryVO = await spider.queryBook(bookname);
        console.log(`bookQueryVO:${JSON.stringify(bookQueryVO)}`);
        await Utils.sleep(3000);
        if (!bookQueryVO) {
            return;
        }
        const chapters = await spider.fetchBookChapters(bookQueryVO.indexPage);
        console.log(`chapters:${JSON.stringify(chapters)}`);
        await Utils.sleep(3000);
        const chapterDetail = await spider.fetchChapterDetail(chapters[10]);
        console.log(`chapterDetail:${JSON.stringify(chapterDetail)}`);

        await Utils.sleep(3000);
        const chapterDetail2 = await spider.fetchChapterDetail(chapters[20]);
        fs.writeFileSync("xxxx.md", chapterDetail2.content);
        console.log(`chapterDetail2:${JSON.stringify(chapterDetail2)}`);
        return 'ok';
    }

    // @Get('/fetchChapters/:name')
    // async fetchChapters(@Param('name') name: string): Promise<string> {
    //     console.log('controller newBook');
    //     // await this.spiderManager.fetchBookChapters(name);
    //     return 'ok';
    // }

    // @Get('/prefetchChapter/:name/:indexId')
    // async prefetchChapter(@Param('name') name: string, @Param('indexId') indexId: number): Promise<string> {
    //     console.log('controller newBook');
    //     indexId = parseInt(indexId + "")
    //     const indexs = [indexId];
    //     for (let i = 0; i <= 10; i++) {
    //         indexId += 1;
    //         indexs.push(indexId);
    //     }
    //     await this.spiderManager.grabBookChapters(name, indexs);
    //     return 'ok';
    // }

    // @Get('/test/')
    // async test(): Promise<string> {
    //     console.log('controller newBook');
    //     await this.spiderManager.queryBookSites("大奉打更人");
    //     return 'ok';
    // }
}
