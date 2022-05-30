import { Injectable } from '@nestjs/common/decorators';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
    private client: Redis;
    constructor(private redisService: RedisService) {
        this.getClient();
    }

    private async getClient() {
        this.client = await this.redisService.getClient();
    }

    /**
     * Description: 封装设置redis缓存的方法
     * param key {String} key值
     * param value {String} key的值
     * param seconds {Number} 过期时间
     * return: Promise&lt;any&gt;
     */
    public async set(key: string, value: any, seconds?: number): Promise<any> {
        value = JSON.stringify(value);
        if (!this.client) {
            await this.getClient();
        }
        if (!seconds) {
            await this.client.set(key, value);
        } else {
            await this.client.set(key, value, 'EX', seconds);
        }
    }

    /**
     * 设置获取redis缓存中的值
     * param key {String}
     */
    public async get(key: string): Promise<any> {
        if (!this.client) {
            await this.getClient();
        }

        const data = await this.client.get(key);

        if (data) {
            return JSON.parse(data);
        } else {
            return null;
        }
    }

    /**
     * Description: 根据key删除redis缓存数据
     * param key {String}
     * return:
     */
    public async del(key: string): Promise<any> {
        if (!this.client) {
            await this.getClient();
        }

        await this.client.del(key);
    }
}
