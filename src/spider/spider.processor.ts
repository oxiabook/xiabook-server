import { Processor, Process, OnQueueActive, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { SpiderManagerService } from './spidermanager.service';
/**
 * 队列消费者
 */
@Processor('SpiderQueue')
export class SpiderProcessor {
    constructor(private readonly spiderManager: SpiderManagerService) {}

    @Process("BookInit")
    async BookInit(job: Job<unknown>) {
        console.log(`quene processor:BookInit ${JSON.stringify(job)}`)
        await this.doBookInit(job.data);
        job.progress(100);
        return {};
    }

    @Process("ChapterPreGrab")
    async ChapterPreGrab(job: Job<unknown>) {
        console.log(`quene processor:ChapterPreGrab ${JSON.stringify(job)}`)
        const ret = await this.prefetchChapter(job.data);
        console.log(`queue:1111`)
        await job.progress(100);
        console.log(`queue:2222`)
        // await job.finished();
        // await job.remove();
        await job.moveToCompleted();
        console.log(`queue:3333`)
        console.log(`quene processor:ChapterPreGrab ${JSON.stringify(job)} done`)
        return ret;
    }
    
    @Process("ReQueryBook")
    async ReQueryBook(job: Job<unknown>) {
        console.log(`quene processor:ReQueryBook ${JSON.stringify(job)}`)
        await this.reQueryBook(job.data);
        job.progress(100);
        return {};
    }

    /**
     * 查徇起点的章节列表
     * @param job 
     * @returns 
     */
    @Process("GrabQDBookChapters")
    async GrabQDBookChapters(job: Job<unknown>) {
        console.log(`quene processor:ChapterPreGrab ${JSON.stringify(job)}`)
        await this.grabQDBookChapter(job.data);
        job.progress(100);
        return {};
    }

    @OnQueueActive()
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
        );
    }

    // @OnQueueCompleted()
    // oncompleted(job: Job) {
    //     console.log(
    //         `job complete ${JSON.stringify(job.data)}`
    //     );
    // }
    private async prefetchChapter(data: any) {
        // this.spiderManager.grabBookChapters(data.bookName, [100,101,102,103])
        console.log(`prefetchChapter:${JSON.stringify(data)}`)
        const bookName = data.bookName;
        let indexId = data.indexId;
        indexId = parseInt(indexId)
        // const indexs = [indexId];
        const ret = await this.spiderManager.grabBookChapter(bookName, indexId);
        console.log(`prefetchChapter:${ret}`);
        return ret
    }

    private async doBookInit(data:any) {
        console.log(`doBookInit:${JSON.stringify(data)}`)
        // this.spiderManager.grabBookChapters(data.bookName, [100,101,102,103])
        const bookName = data.bookName;
        await this.spiderManager.queryBookSites(bookName);
        await this.spiderManager.grabQDBookChapter(bookName);
        for (let i = 0; i <= 10; i++) {
            await this.spiderManager.grabBookChapter(bookName, 1);
        }
    }

    private async grabQDBookChapter(data:any) {
        console.log(`grabQDBookChapter:${JSON.stringify(data)}`)
        // this.spiderManager.grabBookChapters(data.bookName, [100,101,102,103])
        const bookName = data.bookName;
        await this.spiderManager.grabQDBookChapter(bookName);
    }

    private async reQueryBook(data:any) {
        console.log(`reQueryBook:${JSON.stringify(data)}`)
        // this.spiderManager.grabBookChapters(data.bookName, [100,101,102,103])
        const bookName = data.bookName;
        await this.spiderManager.queryBookSites(bookName);
    }
}
