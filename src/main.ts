import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UnauthorizedExceptionFilter } from './unauthorized.controller';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import * as fs from 'firebase-admin';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as http from 'http';
import 'dotenv/config';

export const admin = fs.initializeApp({
  credential: fs.credential.cert('serviceAccount.json'),
  storageBucket: 'gs://tracker-64690.appspot.com/',
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const server = http.createServer(app.getHttpAdapter() as any);
  server.timeout = 3 * 60 * 60 * 1000;

  // renderer global config
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(
    'https://storage.googleapis.com/tracker-64690.appspot.com/',
  );
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // security and validation global config
  // main.ts or AppModule
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  app.use(cookieParser(process.env.COOKIE_SECRET ?? 'secret'));
  app.use(
    session({
      secret: process.env.COOKIE_SECRET ?? 'secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(helmet());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
