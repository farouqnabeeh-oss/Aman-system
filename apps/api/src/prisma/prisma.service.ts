import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
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
      // Temporarily disabled for diagnosis to isolate bootstrap hang
      // await this.$connect();
      this.logger.log('Database connected successfully (SKIPPED FOR DIAGNOSIS)');
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
    const tablenames = await this.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
    `;
    for (const { name } of tablenames) {
      await this.$executeRawUnsafe(`DELETE FROM "${name}"`);
    }
  }
}
