import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'nestjs_user',
      password: process.env.DB_PASSWORD || 'change-this-password',
      database: process.env.DB_NAME || 'nestjs_db',
    });
  }

  async onModuleInit() {
    await this.pool.query('SELECT 1');
    console.log('PostgreSQL connection established successfully');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async getVersion() {
    const result = await this.pool.query('SELECT version()');
    return result.rows[0];
  }
}
