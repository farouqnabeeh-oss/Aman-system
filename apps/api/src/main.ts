import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env before anything else
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

let server: any;

async function createApp(): Promise<NestExpressApplication> {
  console.log('NestJS: Initializing Express...');
  server = express();
  
  console.log('NestJS: Starting NestFactory.create...');
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn', 'log'] },
  );
  console.log('NestJS: NestFactory.create finished.');

  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');
  console.log('NestJS: Global prefix set to api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Only setup Swagger if NOT on Vercel to save memory/time
  if (!process.env['VERCEL']) {
    console.log('NestJS: Setting up Swagger...');
    const config = new DocumentBuilder()
      .setTitle('Enterprise Management System API')
      .setDescription('Production-grade EMS REST API')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .build();

    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  console.log('NestJS: Starting app.init() with 15s timeout...');
  // Hard timeout for app.init to prevent lambda hang
  const initTimeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('app.init() timed out after 15s')), 15000)
  );

  await Promise.race([app.init(), initTimeout]);
  console.log('NestJS: app.init() finished.');
  return app;
}

// For Vercel serverless
let cachedApp: NestExpressApplication;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  return server(req, res);
}

// For local development
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  await createApp();
  const port = process.env['PORT'] ?? 5000;
  server.listen(port, () => {
    logger.log(`🚀 API running on http://localhost:${port}`);
    logger.log(`📚 Swagger at http://localhost:${port}/api/docs`);
  });
}

// Only start local server if not on Vercel
if (!process.env['VERCEL']) {
  bootstrap();
}
