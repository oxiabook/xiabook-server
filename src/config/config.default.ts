export default () => ({
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
        entities: "dist/**/*.entity.js",
        migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
        synchronize: process.env.TYPEORM_SYNCHRONIZE === 'false',
    },
    REDIS: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    }
});