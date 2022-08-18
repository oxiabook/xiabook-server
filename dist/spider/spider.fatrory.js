"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiderFactory = void 0;
const HaoTxt8_spider_1 = require("./sitespider/HaoTxt8.spider");
const QBIQU_spider_1 = require("./sitespider/QBIQU.spider");
const QD_spider_1 = require("./sitespider/QD.spider");
const XBiQukan_spider_1 = require("./sitespider/XBiQukan.spider");
const XSJPW_spider_1 = require("./sitespider/XSJPW.spider");
const spider_define_1 = require("./spider.define");
class SpiderFactory {
    static createSpider(site) {
        return __awaiter(this, void 0, void 0, function* () {
            if (SpiderFactory.instances[site]) {
                return SpiderFactory.instances[site];
            }
            let instance;
            switch (site) {
                case spider_define_1.SpiderSite.QD:
                    instance = new QD_spider_1.QDSpider();
                    break;
                case spider_define_1.SpiderSite.XSJPW:
                    instance = new XSJPW_spider_1.XSJPWSpider();
                    break;
                case spider_define_1.SpiderSite.QBIQU:
                    instance = new QBIQU_spider_1.QBIQUSpider();
                    break;
                case spider_define_1.SpiderSite.XBIQUKAN:
                    instance = new XBiQukan_spider_1.XBiQukanSpider();
                    break;
                case spider_define_1.SpiderSite.HAOTXT8:
                    instance = new HaoTxt8_spider_1.HaoTxt8Spider();
                    break;
                default:
                    throw Error('not support this gun yet');
            }
            yield instance.doInit();
            SpiderFactory.instances[site] = instance;
            return instance;
        });
    }
}
exports.SpiderFactory = SpiderFactory;
SpiderFactory.instances = {};
//# sourceMappingURL=spider.fatrory.js.map