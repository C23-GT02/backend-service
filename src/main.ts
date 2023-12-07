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
import express, { CookieOptions } from 'express';

export const admin = fs.initializeApp({
  credential: fs.credential.cert('serviceAccount.json'),
  storageBucket: 'gs://tracker-64690.appspot.com/',
});

export const duration = 1000 * 3600 * 24 * parseInt(process.env.COOKIES_EXP);
export const cookieOptions: CookieOptions = {
  maxAge: duration,
  httpOnly: true,
  signed: true,
  expires: new Date(Date.now() + duration),
  secure: process.env.ENV_TYPE === 'PROD',
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const server = http.createServer(app.getHttpAdapter() as any);
  server.timeout = 3 * 60 * 60 * 1000;

  // renderer global config
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // security and validation global config
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
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'code.jquery.com',
          'cdn.datatables.net',
        ],
        // Tambahkan domain lain yang Anda perlukan ke dalam directive ini
      },
    }),
  );
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
