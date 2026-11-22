import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_learners_preferred_language" AS ENUM('twi', 'english', 'bilingual');
  CREATE TABLE "learners_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "learners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"bio" varchar,
  	"preferred_language" "enum_learners_preferred_language" DEFAULT 'bilingual',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "learners_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "learners_id" integer;
  ALTER TABLE "learners_sessions" ADD CONSTRAINT "learners_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "learners_sessions_order_idx" ON "learners_sessions" USING btree ("_order");
  CREATE INDEX "learners_sessions_parent_id_idx" ON "learners_sessions" USING btree ("_parent_id");
  CREATE INDEX "learners_updated_at_idx" ON "learners" USING btree ("updated_at");
  CREATE INDEX "learners_created_at_idx" ON "learners" USING btree ("created_at");
  CREATE UNIQUE INDEX "learners_email_idx" ON "learners" USING btree ("email");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_learners_fk" FOREIGN KEY ("learners_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_learners_fk" FOREIGN KEY ("learners_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_learners_id_idx" ON "payload_locked_documents_rels" USING btree ("learners_id");
  CREATE INDEX "payload_preferences_rels_learners_id_idx" ON "payload_preferences_rels" USING btree ("learners_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "learners_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learners" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "learners_sessions" CASCADE;
  DROP TABLE "learners" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_learners_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_learners_fk";
  
  DROP INDEX "payload_locked_documents_rels_learners_id_idx";
  DROP INDEX "payload_preferences_rels_learners_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "learners_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "learners_id";
  DROP TYPE "public"."enum_learners_preferred_language";`)
}
