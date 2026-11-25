import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Operational security table (not a CMS collection). Values contain HMAC bucket digests only.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kasa_auth_rate_limits (
      bucket_key varchar(64) NOT NULL,
      window_start timestamptz NOT NULL,
      attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      expires_at timestamptz NOT NULL,
      PRIMARY KEY (bucket_key, window_start)
    );
    CREATE INDEX IF NOT EXISTS kasa_auth_rate_limits_expires_idx
      ON kasa_auth_rate_limits (expires_at);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS kasa_auth_rate_limits;`)
}
