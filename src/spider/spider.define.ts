export enum SpiderSite {
    QD = 'QD', // 起点
    XSJPW = 'XSJPW', // 小说精品屋
    XBQG = 'XBQG', // 新笔趣阁
    QBIQU = 'QBIQU', // https://www.qbiqu.com/
    XBIQUKAN = 'XBIQUKAN', // https://www.xbiqukan.com/
    HAOTXT8 = 'HaoTxt8', //https://www.haotxt8.com/
}
/**
 * 书籍查徇信息
 */
export interface BookQueryVO {
    /**
     * 采集站点
     */
    siteKey: string | SpiderSite;
    /**
     * 书名
     */
    bookName: string;
    /**
     * 作者
     */
    author: string;
    /**
     * 状态 完本 连载 此状态仅从起点拉取
     */
    status?: string;
    /**
     * 书籍展示图 仅拉取起点图
     */
    bookimg?: string;
    /**
     * 书籍章节页
     */
    indexPage: string;
}
/**
 *  采集站的书籍章节信息
 */
export interface SpiderSiteBookChapterVO{
    /**
     * 书名
     */
    bookName: string;
    /**
     * 抓取站点信息
     */
    siteKey: string | SpiderSite;
    /**
     * 书籍的索引信息
     */
    index:number;
    /**
     * 起点索引ID
     */
    indexId: number;
    /**
     * 章节信息
     */
    title: string;
    /**
     * 章节URL
     */ 
    chapterURL: string;
}

/**
 *  采集站的书籍章节信息
 */
export interface SpiderSiteBookChapterContentVO extends SpiderSiteBookChapterVO{
    /**
     * 章节内容
     */
    content: string;
}

