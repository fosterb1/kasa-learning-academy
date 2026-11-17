import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Additive video classroom schema. No existing lesson, author, or media data
 * is altered; video fields are optional. Apply before deploying the app.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_lessons_video_language" AS ENUM('twi', 'english', 'bilingual');
    CREATE TYPE "public"."enum__lessons_v_version_video_language" AS ENUM('twi', 'english', 'bilingual');
    ALTER TABLE "lessons" ADD COLUMN "video_url" varchar;
    ALTER TABLE "lessons" ADD COLUMN "video_title" varchar;
    ALTER TABLE "lessons" ADD COLUMN "video_language" "enum_lessons_video_language" DEFAULT 'bilingual';
    ALTER TABLE "lessons" ADD COLUMN "transcript_twi" varchar;
    ALTER TABLE "lessons" ADD COLUMN "transcript_english" varchar;
    ALTER TABLE "_lessons_v" ADD COLUMN "version_video_url" varchar;
    ALTER TABLE "_lessons_v" ADD COLUMN "version_video_title" varchar;
    ALTER TABLE "_lessons_v" ADD COLUMN "version_video_language" "enum__lessons_v_version_video_language" DEFAULT 'bilingual';
    ALTER TABLE "_lessons_v" ADD COLUMN "version_transcript_twi" varchar;
    ALTER TABLE "_lessons_v" ADD COLUMN "version_transcript_english" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_lessons_v" DROP COLUMN "version_transcript_english";
    ALTER TABLE "_lessons_v" DROP COLUMN "version_transcript_twi";
    ALTER TABLE "_lessons_v" DROP COLUMN "version_video_language";
    ALTER TABLE "_lessons_v" DROP COLUMN "version_video_title";
    ALTER TABLE "_lessons_v" DROP COLUMN "version_video_url";
    ALTER TABLE "lessons" DROP COLUMN "transcript_english";
    ALTER TABLE "lessons" DROP COLUMN "transcript_twi";
    ALTER TABLE "lessons" DROP COLUMN "video_language";
    ALTER TABLE "lessons" DROP COLUMN "video_title";
    ALTER TABLE "lessons" DROP COLUMN "video_url";
    DROP TYPE "public"."enum__lessons_v_version_video_language";
    DROP TYPE "public"."enum_lessons_video_language";
  `)
}
