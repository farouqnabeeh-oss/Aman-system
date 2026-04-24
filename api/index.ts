import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../apps/api/src/app.module';
import express from 'express';

const server = express();

export const createServer = async () => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.init();
  return server;
};

export default async (req: any, res: any) => {
  const app = await createServer();
  app(req, res);
};
