import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let url = process.env['DATABASE_URL'] || '';
    
    // Strip UTF-8 BOM if present (\uFEFF or %EF%BB%BF)
    if (url.startsWith('\uFEFF')) {
      url = url.substring(1);
    }
    
    if (url && !url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
      url = `postgresql://${url}`;
    }
    
    process.env['DATABASE_URL'] = url;
    
    super({
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Database connection attempt starting...');
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (err) {
      this.logger.error('Database connection failed:', err);
      throw err;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDb(): Promise<void> {
    if (process.env['NODE_ENV'] !== 'test') {
      throw new Error('cleanDb() can only be called in test environment');
    }
    
    const tables = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma_%'
    `;

    for (const { tablename } of tables) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }
}
