"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    PORT: parseInt(process.env.PORT, 10) || 3000,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE: {
        type: 'mysql',
        host: process.env.TYPEORM_HOST || '127.0.0.1',
        username: process.env.TYPEORM_USERNAME || 'root',
        password: process.env.TYPEORM_PASSWORD || '123456',
        database: process.env.TYPEORM_DATABASE || 'smf-book',
        port: parseInt(process.env.TYPEORM_PORT) || 3306,
        logging: false,
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
        synchronize: false,
        retryAttempts: 3
    },
    REDIS: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || ''
    },
    PUPPETEER: {
        host: process.env.XIABOOK_PUPPETEER_HOST || '127.0.0.1',
        port: process.env.XIABOOK_PUPPETEER_PORT || 6379,
    },
    CACHE: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: 0,
        options: {
            reviveBuffers: true,
            binaryAsStream: true,
            ttl: 60 * 60,
            maxsize: 1000 * 1000 * 1000,
            path: 'diskcache',
            preventfill: true,
        },
    }
});
//# sourceMappingURL=configuration.js.map