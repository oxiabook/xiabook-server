import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import cheerio = require('cheerio');
import puppeteer = require('puppeteer');
// import tableParser = require('puppeteer-table-parser');
// import tableParser from 'puppeteer-table-parser';
@Injectable()
export class SpiderService {
    getHello(): string {
        return 'Hello World! spider';
    }

    async queryBook(site: string, name: string): Promise<any> {
        const siteurl = 'http://47.106.243.172:8888/book/bookclass.html?k={book_name}';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const queryurl = encodeURI(siteurl.replace('{book_name}', name));
        console.log(`queryBook:${queryurl}`);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(queryurl, { waitUntil: 'networkidle2' });
        await page.addScriptTag({
            url: 'https://code.jquery.com/jquery-3.2.1.min.js',
        });
        const data = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('#bookList tr td'));
            return tds.map(td => (td as any).innerHTML);
        });
        console.log(`data:${data}`);
        const result = await page.$$eval('#bookList tr', rows => {
            return Array.from(rows, row => {
                const columns = row.querySelectorAll('td');
                const cell = Array.from(columns, (column: any) => column.innerHTML);
                console.log(cell);
                return cell;
            });
        });
        console.log(`result:${result}`);

        // const data = await tableParser(page, {
        //   selector: 'table',
        //   colFilter: (value: string[]) => {
        //     return value.join(' ').replace(' ', '-').toLowerCase();
        //   },
        //   colParser: (value: string) => {
        //     return value.trim();
        //   },
        //   allowedColNames: {
        //     书名: 'name',
        //     作者: 'author',
        //     类别: '类别',
        //     // 'horse-powers': 'hp',
        //     // 'manufacture-year': 'year',
        //   },
        // });
        // console.log(`data:${data}`);
        // const tableValue = await page.$eval('#bookList', (el) => el.value);
        // const rows = await page.$$eval('#bookList tr', (row) => row);
        // console.log(rows);
        // await page.screenshot({
        //   path: '1.png',
        //   fullPage: true,n
        // });
        // const result = await page.evaluate(() => {
        //   const html = $('#bookList').html();
        //   $('#bookList tr').each(() => {
        //     $(this).find("td").html()
        //   })
        //   console.log(`html:${html}`);
        //   return html;
        // });
        // console.log(`result:${result}`);

        // const result = await page.$$eval('#bookList tr', (rows) => {
        //   console.log(`xxxx:${rows}`);
        //   return Array.from(rows, (row) => {
        //     const columns = row.querySelectorAll('td');
        //     const cell = Array.from(columns, (column: any) => column.innerText);
        //     console.log(cell);
        //     return cell;
        //   });
        // });
        // console.log(result);
        // await page.pdf({path: 'hn.pdf', format: 'A4'});
        // await browser.close();
        // const response = await axios.get(queryurl);
        // console.log(response.data);
        // const data = response.data;
        // await this.parseQuery(data);
        // return response.data;
    }

    // async parseQuery(data: string) {
    //   const $ = cheerio.load(data);
    //   cheerioTableparser($);
    //   const h = $('#booklist').html();
    //   console.log(h)
    //   const bookinfo = ($ as any)('#booklist').parsetable(true, true, true);
    //   console.log(bookinfo);
    // }
}
