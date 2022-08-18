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
import BrowserManager from './browser.manager';
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
        // @Inject('browserManager')
        // private browserManager: BrowserManager,
        @InjectQueue('SpiderQueue') private spiderQueue: Queue
    ) {
        console.log(`SpiderManagerService: constructor`);
    }
    /**
     * 取得能爬取某书籍内容的站点列表
     * @param name string;
     */
    async queryBookSites(name: string): Promise<any> {
        // console.log(`queryBookSites:${name}`)
        await this.delAllBookQuery(name);
        const sites: SpiderSite[] = [SpiderSite.QD, SpiderSite.QBIQU, SpiderSite.XSJPW, SpiderSite.XBIQUKAN, SpiderSite.HAOTXT8];
        for (const site of sites) {
            const queryEntity = await this.getLocalBookQuery(name, site);
            if (queryEntity) {continue;}
            const spider = await SpiderFactory.createSpider(site);
            const bookQueryVO = await spider.queryBook(name);
            // console.log(`queryBookSites:site:${site} ${JSON.stringify(bookQueryVO)}`);
            if (!bookQueryVO) continue;
            await this.saveBookQuery(bookQueryVO);
            // console.log(bookQueryVO);
            await Utils.sleep(1000);
        }
    }

    /**
     * 取得某站点的章节列表
     * @param queryEntity 
     * @returns 
     */
    async getSiteChaptersFromCache(queryEntity: BooksQueryEntity) {
        // console.log(`getSiteChaptersFromCache:${queryEntity.siteKey} ${queryEntity.bookName}`)
        const key = `bookchaptermap_${queryEntity.siteKey}_${queryEntity.bookName}`;
        const chapters = await this.cacheManager.get(key);
        if (_.isEmpty(chapters)) {
            const spider = await SpiderFactory.createSpider(queryEntity.siteKey as SpiderSite);
            const chapters = await spider.fetchBookChapters(queryEntity.indexPage);
            if (chapters.length === 0) return false;
            await this.cacheManager.set(key, chapters, { ttl: 36000 });
        }
        return chapters;
    }

    /**
     * 从某站点获取某章节具体内容
     * @param siteChapterVO 
     * @returns 
     */
    async grabChapterDetailFromOneSite(siteChapterVO:SpiderSiteBookChapterVO) {
        console.log(`grabChapterDetailFromOneSite1:${siteChapterVO.bookName} ${siteChapterVO.indexId} ${siteChapterVO.siteKey}`)
        const spider = await SpiderFactory.createSpider(siteChapterVO.siteKey as SpiderSite);
        const chapterContentVO = await spider.fetchChapterDetail(siteChapterVO);
        let addOrSub = 0;
        if (chapterContentVO.content) {
            addOrSub = 1;
        } else {
            addOrSub = -1;
        }
        await this.updateBookSiteWeight(siteChapterVO.bookName, siteChapterVO.siteKey, addOrSub);
        if (chapterContentVO.content) {
            await this.saveChapterContent(siteChapterVO.bookName, chapterContentVO);
            await this.updateChapterFetched(siteChapterVO.bookName, chapterContentVO.indexId);
        }
        return chapterContentVO.content !== "";
    }

    async updateBookSiteWeight(bookName: string, siteKey:SpiderSite|string, addOrSub:number) {
        const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
        query.where('bookName = :bookName AND siteKey = :siteKey', { bookName, siteKey });
        const entity = await query.getOne();
        entity.weight += addOrSub;
        if (entity.weight > 100) entity.weight = 100;
        if (entity.weight < 0) entity.weight = 0;
        const res = await this.queryRepository.save(entity);
        // return res.affected === 1;
        return true;
    }

    /**
     * 抓取某一章
     * @param bookName 
     * @param qdChapterEntity 
     */
    async grabOneChapter(bookName:string, qdChapterEntity: ChapterEntity) {
        console.log(`grabOneChapter:${bookName} ${qdChapterEntity.indexId}`)
        const allQuerys = await this.getBookAllQuery(bookName);
        for (const queryEntity of allQuerys) {
            const siteChapters = await this.getSiteChaptersFromCache(queryEntity);
            if (!siteChapters) continue;
            const siteChapterVO = _.find(siteChapters, {title:qdChapterEntity.title});
            if (!siteChapterVO) continue;
            siteChapterVO.indexId = qdChapterEntity.indexId;
            siteChapterVO.bookName = qdChapterEntity.bookName;
            const ret = await this.grabChapterDetailFromOneSite(siteChapterVO);
            if (!ret) continue;
            return true;
        }
        return false;
    }

    async grabBookChapter(bookName: string, indexId: number): Promise<any> {
        console.log(`spiderManager:grabBookChapter:${bookName}, ${indexId}`)
        const qdChapter = await this.queryBookNeedFetchChapter(bookName, indexId);
        if (!qdChapter) {
            console.log(`章节已存在:${bookName} ${indexId}`)
            return true;
        }
        return await this.grabOneChapter(bookName, qdChapter);
    }

    async saveChapterContent(bookName:string, chapterContentVO: SpiderSiteBookChapterContentVO) {
        console.log(`saveChapterContent: indexId ${chapterContentVO.indexId}`)
        bookName = _.trim(bookName)
        const content = `# ${bookName} \n ## ${chapterContentVO.title}\n ${chapterContentVO.content} \n${chapterContentVO.siteKey}`
        const filename = `${process.cwd()}/runtime/books/${bookName}/${chapterContentVO.indexId}.md`
        Utils.checkdir(filename);
        fs.writeFileSync(filename, content);
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
        console.log(`grabQDBookChapter:${name}`)
        const bookQueryEntity = await this.getLocalBookQuery(name, SpiderSite.QD);
        console.log(bookQueryEntity)
        const spider = await SpiderFactory.createSpider(SpiderSite.QD);
        const chapters = await spider.fetchBookChapters(bookQueryEntity.indexPage);
        console.log(`抓取到起点章节列表:${name} ${chapters.length}`)
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
    async queryBookNeedFetchChapter(name: string, indexId: number): Promise<ChapterEntity> {
        // console.log(`queryBookNeedFetchChapter:${name} ${indexId}`)
        const siteKey = SpiderSite.QD;
        const isFetched = 0;
        const query = this.chapterRepository.createQueryBuilder('chapter')
        query.where('bookName = :name AND siteKey = :siteKey AND isFetched = :isFetched AND indexId = :indexId', { name, siteKey, isFetched, indexId })
        const entity = await query.getOne();
        return entity;
    }

    /**
     * 取得书籍所有远程查徇信息
     * 排除QD
     * @param bookName 
     * @returns 
     */
    async getBookAllQuery(bookName: string) {
        const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
        query.where('bookName = :bookName AND siteKey != :siteKey', { bookName, siteKey: SpiderSite.QD});
        query.orderBy('weight', 'DESC')
        const bookQueryEntitys = await query.getMany();
        return bookQueryEntitys;
    }

    async getLocalBookQuery(name: string, siteKey: SpiderSite): Promise<BooksQueryEntity> {
        const query = this.queryRepository.createQueryBuilder('BookQueryEntity');
        query.where('bookName = :name AND siteKey = :siteKey', { name, siteKey });
        const bookQueryEntity = await query.getOne();
        return bookQueryEntity;
    }

    /**
     * 保存起点的书籍章节信息
     * @param name
     * @param siteKey
     * @param chapters
     */
    async saveQDBookChapters(name: string, chapters: SpiderSiteBookChapterVO[]) {
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
                    console.log(`savedQDChapter:${name} ${chapterEntity.id}`);
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
     * 删除书籍的所有查徇信息
     * 一般只要重查书籍时删除
     * @param bookName 
     * @returns 
     */
    async delAllBookQuery(bookName: string) {
        console.log(`删除${bookName}的所有远端查徇`)
        const res = await this.queryRepository.delete({bookName});
        return res.affected > 0;
    }

    /**
     * 取得小说的起点的章节列表
     * @param name string
     */
    async grabBookQDChapters(name: string): Promise<any> {
        console.log(name);
    }
}
