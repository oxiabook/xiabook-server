import * as fs from 'fs'
import * as path from 'path'
export default class Utils {
    /**
     * 等待指定的时间
     * @param ms
     */
    static async sleep(ms: number) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }

    static checkdir(filename: string) {
        console.log(`checkdir:${filename}`)
        const dirname = path.dirname(filename)
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true })
        }
    }
}
