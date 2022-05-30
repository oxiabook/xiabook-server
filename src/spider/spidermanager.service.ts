import { HttpException, HttpStatus, Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { BooksQueryEntity } from '../entity/booksquery.entity';
import { ChapterEntity } from '../entity/chapter.entity';
import { BookQueryVO, SpiderSite, SpiderSiteBookChapterContentVO, SpiderSiteBookChapterVO } from './spider.define';
import { SpiderFactory } from './spider.fatrory';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import Utils from './Utils';
import * as fs from 'fs'
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
// import BrowserManager from './browser.manager';

@Injectable()
export class SpiderManagerService {
    constructor(
        @InjectRepository(BooksQueryEntity)
        private readonly queryRepository: Repository<BooksQueryEntity>,
        @InjectRepository(ChapterEntity)
        private readonly chapterRepository: Repository<ChapterEntity>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        @InjectQueue('SpiderQueue') private spiderQueue: Queue
    ) {
        console.log(`SpiderManagerService: constructor`);
        // const browserManager = BrowserManager.I();
        // await browserManager.doInit();
    }

    // public async addBookInitGrabJob(bookName:string) {
    //     const job = await this.spiderQueue.add('BookInit', {
    //         bookName: bookName,
    //     });
    //     console.log(`job:${job}`)
    // }

    // public async addChapterPreGrabJob(bookName: string, indexId: number){
    //     console.log(`addChapterPreGrabJob:${bookName} ${indexId}`)
    //     const job = await this.spiderQueue.add('ChapterPreGrab', {
    //         bookName,
    //         indexId,
    //     });
    //     console.log(`job:${job}`)
    // }

    /**
     * 取得能爬取某书籍内容的站点列表
     * @param name string;
     */
    async queryBookSites(name: string): Promise<any> {
        // console.log(name);
        const sites: SpiderSite[] = [SpiderSite.QD, SpiderSite.QBIQU, SpiderSite.XSJPW, SpiderSite.XBIQUKAN, SpiderSite.HAOTXT8];
        // const sites: SpiderSite[] = [SpiderSite.HAOTXT8];
        // const sites: SpiderSite[] = [SpiderSite.QD];
        for (const site of sites) {
            const queryEntity = await this.getLocalBookQuery(name, site);
            if (queryEntity) {continue;}
            const spider = await SpiderFactory.createSpider(site);
            const bookQueryVO = await spider.queryBook(name);
            console.log(`queryBookSites:site:${site} ${JSON.stringify(bookQueryVO)}`);
            if (!bookQueryVO) continue;
            await this.saveBookQuery(bookQueryVO);
            // console.log(bookQueryVO);
            await Utils.sleep(1000);
        }
        // await this.fetchQDBookChapter(name);
    }

    async grabSiteChaptersFromCache(site:SpiderSite, bookName:string) {
        const key = `bookchapters_${site}_${bookName}`;
        let siteChapters: SpiderSiteBookChapterVO[] = await this.cacheManager.get(key);
        if (_.isEmpty(siteChapters)) {
            const spider = await SpiderFactory.createSpider(site);
            const bookQueryVO = await spider.queryBook(bookName);
            if (!bookQueryVO) return [];
            siteChapters = await spider.fetchBookChapters(bookQueryVO.indexPage);
            // console.log(`siteChapters:${siteChapters.length}`);
            await this.cacheManager.set(key, siteChapters, { ttl: 36000 });
        }
        return siteChapters;
    }

    /**
     * 抓取某一章
     * @param bookName 
     * @param qdChapterEntity 
     */
    async grabOneChapter(bookName:string, qdChapterEntity: ChapterEntity) {
        // console.log(`grabOneChapter:${bookName} ${qdChapterEntity.indexId}`)
        const allQuerys = await this.getBookAllQuery(bookName);
        for (const queryEntity of allQuerys) {
            console.log(`grabOneChapter:${queryEntity.siteKey} ${bookName} ${qdChapterEntity.indexId}`)
            const siteChapters = await this.grabSiteChaptersFromCache(queryEntity.siteKey as SpiderSite, bookName);
            if (siteChapters.length == 0) continue;
            // fs.writeFileSync(`${queryEntity.siteKey}-chapters.json`, JSON.stringify(siteChapters));
            for (const siteChapterVO of siteChapters) {
                if (qdChapterEntity.title != siteChapterVO.title) {
                    // console.log(`qd:${qdChapterEntity.title} - ${siteChapterVO.title}`);
                    continue;
                }
                console.log(`${queryEntity.siteKey} qd:${qdChapterEntity.title} - ${siteChapterVO.title}`);
                // console.log(`siteChapterVO:${JSON.stringify(siteChapterVO)}`);
                // console.log(`qdChapterEntity:${JSON.stringify(qdChapterEntity)}`);
                siteChapterVO.indexId = qdChapterEntity.indexId;
                const spider = await SpiderFactory.createSpider(queryEntity.siteKey as SpiderSite);
                const chapterContentVO = await spider.fetchChapterDetail(siteChapterVO);
                // console.log(`bookName:${bookName} chapterContentVO:${JSON.stringify(chapterContentVO)}`);
                if (chapterContentVO.content) {
                    queryEntity.weight =  queryEntity.weight + 1;
                    if (queryEntity.weight > 100) queryEntity.weight = 100;
                } else {
                    queryEntity.weight =  queryEntity.weight - 1;
                }
                // console.log(`xxxxxxx:${JSON.stringify(chapterContentVO)}`)
                await this.updateBookQueryWeight(queryEntity);
                await this.saveChapterContent(bookName, chapterContentVO);
                await this.updateChapterFetched(bookName, chapterContentVO.indexId);
            }
            break;
        }
    }

    async grabBookChapters(bookName: string, indexs: number[]): Promise<any> {
        console.log(`grabBookChapters:${bookName}, ${indexs}`)
        const qdChapters = await this.queryBookNeedFetchChapters(bookName, indexs);
        // const allQuerys = await this.getBookAllQuery(bookName);
        // console.log(`allQuerys:${JSON.stringify(allQuerys)}`)
        for (const qdChapterEntity of qdChapters) {
            await this.grabOneChapter(bookName, qdChapterEntity);
            await Utils.sleep(3000);
        }

        // for (const queryEntity of allQuerys) {
        //     const siteChapters = await this.grabSiteChaptersFromCache(queryEntity.siteKey as SpiderSite, bookName);
        //     const needFetchChapters:SpiderSiteBookChapterVO[] = [];
        //     for (const chapterEntity of qdChapters) {
        //         for (const siteChapterVO of siteChapters) {
        //             if (chapterEntity.title === siteChapterVO.title) {
        //                 siteChapterVO.indexId = chapterEntity.indexId;
        //                 needFetchChapters.push(siteChapterVO);
        //             }
        //         }
        //     }
        //     console.log(`needFetchChapters:${JSON.stringify(needFetchChapters)}`);
        //     for (const siteChapterVO of needFetchChapters) {
        //         const spider = await SpiderFactory.createSpider(queryEntity.siteKey as SpiderSite);
        //         const chapterContentVO = await spider.fetchChapterDetail(siteChapterVO);
        //         console.log(`bookName:${bookName} chapterContentVO:${JSON.stringify(chapterContentVO)}`);
        //         await this.saveChapterContent(bookName, chapterContentVO)
        //         await this.updateChapterFetched(bookName, chapterContentVO.indexId)
        //         await Utils.sleep(3000);
        //     }
        //     // await this.saveBookQuery(bookQueryVO);
        // }
    }

    async saveChapterContent(bookName:string, chapterContentVO: SpiderSiteBookChapterContentVO) {
        console.log(`saveChapterContent: indexId ${chapterContentVO.indexId}`)
        bookName = _.trim(bookName)
        const content = `# ${bookName} \n ## ${chapterContentVO.title}\n ${chapterContentVO.content} \n${chapterContentVO.siteKey}`
        const filename = `${process.cwd()}/runtime/books/${bookName}/${chapterContentVO.indexId}.md`
        Utils.checkdir(filename);
        fs.writeFileSync(filename, content);
    }

    async updateBookQueryWeight(bookQueryEntity: BooksQueryEntity) {
        return await this.queryRepository.save(bookQueryEntity);
    }

    /**
     * 更新章节已抓取
     * @param bookName 
     * @param indexId 
     * @returns 
     */
    async updateChapterFetched(bookName: string, indexId: number): Promise<boolean>{
        const res = await this.chapterRepository.update({bookName, indexId}, {isFetched:1})
        return res.affected === 1;
    }

    // async

    /**
     * 查徇书籍的章节并写入db
     * 仅查徇起点的章节页
     * @param name
     */
    async grabQDBookChapter(name: string): Promise<any> {
        const bookQueryEntity = await this.getLocalBookQuery(name, SpiderSite.QD);
        const spider = await SpiderFactory.createSpider(SpiderSite.QD);
        const chapters = await spider.fetchBookChapters(bookQueryEntity.indexPage);
        // console.log(`${JSON.stringify(chapters)}`);
        await this.saveQDBookChapters(name, chapters);
        return chapters;
        // const
    }

    /**
     * 获取本地存储的书籍的章节列表
     * @param name 
     * @returns 
     */
    async queryLocalChapters(name: string): Promise<any> {
        const siteKey = SpiderSite.QD;
        const chapters = await this.chapterRepository
            .createQueryBuilder('ChapterEntity')
            .where('bookName = :name AND siteKey = :siteKey ', { name, siteKey })
            .orderBy('indexId')
            .getMany();
        return chapters;
    }

    /**
     * 取得书籍需要爬取的章节
     * 取起点的章节
     * @param name
     * @returns
     */
    async queryBookNeedFetchChapters(name: string, indexs: number[]): Promise<ChapterEntity[]> {
        const siteKey = SpiderSite.QD;
        const isFetched = '0';
        const chapters = await this.chapterRepository
            .createQueryBuilder('ChapterEntity')
            .where('bookName = :name AND siteKey = :siteKey AND isFetched = :isFetched', { name, siteKey, isFetched })
            .andWhere('indexId in (:...indexs)', {indexs})
            .orderBy('indexId')
            .getMany();
        return chapters;
    }

    /**
     * 取得书籍所有查徇信息
     * @param bookName 
     * @returns 
     */
    async getBookAllQuery(bookName: string) {
        const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
        query.where('bookName = :bookName AND siteKey != :siteKey', { bookName, siteKey: SpiderSite.QD});
        query.orderBy('weight', 'DESC')
        const bookQueryEntitys = await query.getMany();
        // const bookQueryEntitys = await this.queryRepository.createQueryBuilder('BookQueryEntity').where('bookName = :bookName AND siteKey != `QD`', { bookName }).orderBy('weight', 'DESC').getMany();
        return bookQueryEntitys;
    }

    async getLocalBookQuery(name: string, siteKey: SpiderSite): Promise<BooksQueryEntity> {
        const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
        query.where('bookName = :name AND siteKey = :siteKey', { name, siteKey });
        const bookQueryEntity = await query.getOne();
        // const bookQueryEntity = .where('bookName = :name AND siteKey = :siteKey', { name, siteKey }).getOne();
        return bookQueryEntity;
    }

    /**
     * 保存起点的书籍章节信息
     * @param name
     * @param siteKey
     * @param chapters
     */
    async saveQDBookChapters(name: string, chapters: SpiderSiteBookChapterVO[]) {
        // return (await getManager(instance)).getRepository(Category)
        // const connect =
        // const typeorm = await TypeOrmModule.forFeature([ChapterEntity]);
        for (const chapterVO of chapters) {
            const chapterEntity = new ChapterEntity();
            chapterEntity.bookName = name;
            chapterEntity.title = chapterVO.title;
            chapterEntity.indexId = chapterVO.index;
            chapterEntity.isFetched = 0;
            chapterEntity.isValid = 0;
            chapterEntity.siteKey = SpiderSite.QD;
            chapterEntity.chapterURL = chapterVO.chapterURL;
            const errors = await validate(chapterEntity);
            try {
                if (errors.length > 0) {
                    const _errors = { username: 'Userinput is not valid.' };
                    throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);
                } else {
                    await this.chapterRepository.save(chapterEntity);
                    console.log(`savedChapter:${chapterEntity.id}`);
                    //  savedChapter;
                }
            } catch (error) {
                console.error(error.message);
                continue;
            }
        }
    }

    async saveBookQuery(bookQueryVO: BookQueryVO) {
        console.log(`saveBookQuery:${JSON.stringify(bookQueryVO)}`);
        const newBookQuery = new BooksQueryEntity();
        newBookQuery.bookName = bookQueryVO.bookName;
        newBookQuery.author = bookQueryVO.author;
        newBookQuery.bookimg = bookQueryVO.bookimg;
        newBookQuery.indexPage = bookQueryVO.indexPage;
        newBookQuery.siteKey = bookQueryVO.siteKey;
        newBookQuery.status = bookQueryVO.status;
        const errors = await validate(newBookQuery);
        if (errors.length > 0) {
            const _errors = { username: 'Userinput is not valid.' };
            throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);
        } else {
            const savedBook = await this.queryRepository.save(newBookQuery);
            return savedBook;
        }
    }

    /**
     * 取得小说的起点的章节列表
     * @param name string
     */
    async grabBookQDChapters(name: string): Promise<any> {
        console.log(name);
    }
}
