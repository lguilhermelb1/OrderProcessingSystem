import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.pool = new Pool({
      host: this.configService.getOrThrow<string>('POSTGRES_HOST'),
      port: this.configService.getOrThrow<number>('POSTGRES_PORT'),
      user: this.configService.getOrThrow<string>('POSTGRES_USER'),
      password: this.configService.getOrThrow<string>('POSTGRES_PASSWORD'),
      database: this.configService.getOrThrow<string>('POSTGRES_DB'),
      max: this.configService.getOrThrow<number>('POSTGRES_MAX_CONNECTIONS'),
      idleTimeoutMillis: 30000,
    });

    this.logger.log('Database connection pool initialized');

    const client = await this.pool.connect();
    try {
      const res = await client.query<{ db: string; now: string }>(
        'SELECT NOW() as now, current_database() as db',
      );
      this.logger.log(
        `Connected to database: ${res.rows[0].db} at ${res.rows[0].now}`,
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error connecting to database: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database connection pool closed');
  }
}
