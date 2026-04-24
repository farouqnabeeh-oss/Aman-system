import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../apps/api/src/app.module';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const server = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn'] }
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.init();
  cachedServer = server;
  return cachedServer;
}

export default async (req: any, res: any) => {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (err: any) {
    console.error('SERVERLESS_BOOTSTRAP_ERROR:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_BOOTSTRAP_FAILED',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });
  }
};
