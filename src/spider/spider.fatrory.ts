import { HaoTxt8Spider } from './sitespider/HaoTxt8.spider';
import { QBIQUSpider } from './sitespider/QBIQU.spider';
import { QDSpider } from './sitespider/QD.spider';
import { XBiQukanSpider } from './sitespider/XBiQukan.spider';
// import { XBQGSpider } from './sitespider/XBQG.spider';
import { XSJPWSpider } from './sitespider/XSJPW.spider';
// import { XSJPWSpider } from './sitespider/XSJPW.spider';
import { BaseSpider } from './spider.base';
import { SpiderSite } from './spider.define';
/**
 * 蜘蛛工厂
 *
 * @export
 * @class SpiderFactory
 */
export class SpiderFactory {

    public static instances = {};
    /**
     * 创建一个站点的爬虫
     * @param site SpiderSite
     * @returns BaseSpider
     */
    static async createSpider(site: SpiderSite): Promise<BaseSpider> {
        // console.log(`createSpider:${SpiderFactory.instances[site]}`)
        if (SpiderFactory.instances[site]) {
            return SpiderFactory.instances[site]
        }
        let instance:BaseSpider;
        switch (site) {
        case SpiderSite.QD:
            instance = new QDSpider();
            break;
        case SpiderSite.XSJPW:
            instance = new XSJPWSpider();
            break;
        case SpiderSite.QBIQU:
            instance = new QBIQUSpider();
            break;
        case SpiderSite.XBIQUKAN:
            instance = new XBiQukanSpider();
            break;
        case SpiderSite.HAOTXT8:
            instance = new HaoTxt8Spider();
            break;
        // case SpiderSite.HAOTXT8:
        //     instance = new HaoTxt8Spider();
        //     break;
        default:
            throw Error('not support this gun yet');
        }
        await instance.doInit();
        SpiderFactory.instances[site] = instance;
        return instance;
    }
}
