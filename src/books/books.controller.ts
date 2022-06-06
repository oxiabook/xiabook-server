import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SpiderManagerService } from "../spider/spidermanager.service";
import { BooksEntity } from "./books.entity";
import { BooksService } from "./books.service";
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import * as fs from 'fs';
import Bull = require("bull");
@Controller("books")
export class BooksController {
    constructor(
        private readonly booksService: BooksService, 
        private readonly spiderManagerService: SpiderManagerService, 
        @InjectQueue('SpiderQueue') private spiderQueue: Queue
    ) { }

    // @Get("/newbook/:name")
    @Post("/newbook")
    async newbook(@Body() body): Promise<BooksEntity> {
        console.log(`controller newBook ${JSON.stringify(body)}`);
        const bookName = body.bookName;
        console.log(`name:${bookName}`);
        let booksEntity = await this.booksService.getBookByName(bookName);
        if (!booksEntity) {
            booksEntity = await this.booksService.newWantBook(bookName);
        }
        // await this.spiderManagerService.queryBookSites(bookName);
        // await this.spiderManagerService.grabQDBookChapter(bookName);
        // await this.spiderManagerService.grabBookChapters(bookName, 1);
        await this.spiderQueue.add('BookInit', {
            bookName: bookName,
        });
        return booksEntity;
    }

    // @Get("/newbook/:name")
    @Get("/")
    async getBooks(@Body() body): Promise<BooksEntity[]> {
        console.log(`controller getBooks ${JSON.stringify(body)}`);
        const booksEntitys = await this.booksService.getBooks();
        return booksEntitys;
    }

    @Get("/reQueryBook/:name")
    async reQueryBook(@Param("name") name: string): Promise<any> {
        await this.spiderQueue.add('ReQueryBook', {
            bookName: name,
        });
    }

    @Get("/bookhome/:name")
    async bookhome(@Param("name") name: string): Promise<any> {
        const bookEntity = await this.booksService.getBookByName(name);
        const bookChapters = await this.spiderManagerService.queryLocalChapters(name)
        if (bookChapters.length == 0) {
            await this.spiderQueue.add('GrabQDBookChapters', {
                bookName: name,
            });
        }
        return {
            bookEntity, bookChapters
        };
    }

    @Get("/readchapter/:name/:indexId")
    async readchapter(@Param("name") name: string, @Param("indexId") indexId: string): Promise<any> {
        const filename = `${process.cwd()}/runtime/books/${name}/${indexId}.md`
        let data = "";
        if (fs.existsSync(filename)) {
            data = fs.readFileSync(filename, 'utf-8');
        }
        // 预拉取10章
        for (let i = 0; i <= 3; i++) {
            let preIndexId = parseInt(indexId) + i;
            const jobId = `ChapterPreGrab-${name}-${preIndexId}`
            console.log(`pregrab:${jobId}`)
            // const job:Bull.Job = await this.spiderQueue.getJob(jobId);
            // if (job) {
            //     console.log(`任务检测:${jobId}已存在:${JSON.stringify(job)}`)
            //     // return;
            // }
            await this.spiderQueue.add('ChapterPreGrab', {
                bookName:name,
                indexId:preIndexId,
            }, {jobId});
            // await this.spiderQueue.add('ChapterPreGrab', {
                // bookName:name,
                // indexId:preIndexId,
            // });
        }

        return data;
    }

    @Get("/test/:name")
    async test(@Param("name") name: string, @Param("indexId") indexId: string): Promise<any> {
        const filename = `${process.cwd()}/runtime/books/${name}/${indexId}.md`
        const data = fs.readFileSync(filename);
        return data.toString();
        // const bookEntity = await this.booksService.getBookByName(name);
        // const bookChapters = await this.spiderManagerService.queryBookChapters(name)
        // return {
        //     bookEntity, bookChapters
        // };
    }

    @Get("/bookReadSidebar/:name")
    async bookReadSidebar(@Param("name") name: string): Promise<string> {
        // console.log("controller newBook");
        // const booksEntity = await this.booksService.newWantBook(name);
        // return booksEntity;
        console.log(name);
        const res = `
        * [首页](zh-cn/)
        * [《之诸天万界》数字藏品预约开始啦！](大奉打更人/《之诸天万界》数字藏品预约开始啦！.md)
        * [第二章妖物作祟](大奉打更人/第二章 妖物作祟.md)
        `
        return res;
    }

    // @Get("/home/")
    // async bookhome(): Promise<string> {
    //     // console.log("controller newBook");
    //     // const booksEntity = await this.booksService.newWantBook(name);
    //     // return booksEntity;
    //     // console.log(name);
    //     const res = `
    //     # Headline
    //     > An awesome project.
    //     [《之诸天万界》数字藏品预约开始啦！](大奉打更人/《之诸天万界》数字藏品预约开始啦！.md)
    //     `
    //     return res;
    // }

    @Get("/index")
    async indexhome(): Promise<string> {
        // console.log("controller newBook");
        // const booksEntity = await this.booksService.newWantBook(name);
        // return booksEntity;
        // console.log(name);
        const res = `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Description">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="/public/vendor/themes/vue.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'xiaix',
      repo: '',
      crossOriginLinks: [''],
      loadSidebar:true,
      basePath: 'http://127.0.0.1:3000',
      homepage: '/books/home',
      loadSidebar:"books/bookReadSidebar/%E5%A4%A7%E5%A5%89%E6%89%93%E6%9B%B4%E4%BA%BA"
    }
  </script>
  <script src="/public/vendor/docsify.js"></script>
</body>
</html>
        `
        return res;
    }

}
