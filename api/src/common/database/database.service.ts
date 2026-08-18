import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private pool!: Pool;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
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
    }

    async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, params);
    }

    async onModuleDestroy() {
        await this.pool.end();
        this.logger.log('Database connection pool closed');
    }
}
