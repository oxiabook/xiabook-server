import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path'
import * as serveStatic from 'serve-static';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // const configService = app.get(ConfigService);
    // configService.set("ROOT_PATH", )
    // console.log(configService)
    console.log(path.resolve("./"))
    app.use('/public', serveStatic(path.join(__dirname, '../public'), {
        maxAge: '1d',
        extensions: ['jpg', 'jpeg', 'png', 'gif'],
    }));
    app.enableCors()
    await app.listen(3000);
}
// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
//     AppModule,
//     {
//       transport: Transport.TCP,
//     },
//   );
//   app.listen(3000);
// }
bootstrap();
