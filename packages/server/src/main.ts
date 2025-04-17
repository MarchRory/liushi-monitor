import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'
import * as  fs from 'fs'
import * as CookieParser from 'cookie-parser'
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync('../cert/localhost+2-key.pem'),
      cert: fs.readFileSync('../cert/localhost+2.pem')
    },
    cors: {
      origin: 'https://localhost:5173', // 前端开发环境
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    }
  });
  app.useGlobalPipes(new ValidationPipe())
  app.use(CookieParser())
  await app.listen(process.env.PORT ?? 443);
}
bootstrap();
