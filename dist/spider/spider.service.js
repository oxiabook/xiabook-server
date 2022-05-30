"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.SpiderService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = require("puppeteer");
let SpiderService = class SpiderService {
    getHello() {
        return 'Hello World! spider';
    }
    queryBook(site, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const siteurl = 'http://47.106.243.172:8888/book/bookclass.html?k={book_name}';
            const queryurl = encodeURI(siteurl.replace('{book_name}', name));
            console.log(`queryBook:${queryurl}`);
            const browser = yield puppeteer.launch();
            const page = yield browser.newPage();
            yield page.goto(queryurl, { waitUntil: 'networkidle2' });
            yield page.addScriptTag({
                url: 'https://code.jquery.com/jquery-3.2.1.min.js',
            });
            const data = yield page.evaluate(() => {
                const tds = Array.from(document.querySelectorAll('#bookList tr td'));
                return tds.map(td => td.innerHTML);
            });
            console.log(`data:${data}`);
            const result = yield page.$$eval('#bookList tr', rows => {
                return Array.from(rows, row => {
                    const columns = row.querySelectorAll('td');
                    const cell = Array.from(columns, (column) => column.innerHTML);
                    console.log(cell);
                    return cell;
                });
            });
            console.log(`result:${result}`);
        });
    }
};
SpiderService = __decorate([
    (0, common_1.Injectable)()
], SpiderService);
exports.SpiderService = SpiderService;
//# sourceMappingURL=spider.service.js.map