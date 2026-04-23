import { Pool, QueryResult, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * DatabaseClient handles the connection pool to the Supabase PostgreSQL database.
 * It reads the SUPABASE_URI from the environment variables.
 */
export class DatabaseClient {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.SUPABASE_URI;
    
    if (!connectionString) {
      throw new Error('SUPABASE_URI is not defined in environment variables');
    }

    this.pool = new Pool({
      connectionString,
      // Supabase requires SSL for external connections
      ssl: {
        rejectUnauthorized: false
      },
      // Pool configuration
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle database client:', err);
    });

    this.testConnection();
  }

  private async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Successfully connected to Supabase Database');
      client.release();
    } catch (err: any) {
      console.error('❌ Failed to connect to Supabase Database:', err.message);
    }
  }

  /**
   * Execute a query against the database
   */
  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Shut down the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
  private static instance: DatabaseClient;

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }
}

export const dbClient = DatabaseClient.getInstance();
