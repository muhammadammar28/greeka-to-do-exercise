import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1755260654600 implements MigrationInterface {
  name = 'InitialSchema1755260654600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('Pending', 'Done', 'In Progress', 'Paused')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('Red', 'Yellow', 'Blue')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "dueDate" TIMESTAMP, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'Pending', "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'Blue', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bf318ca48fd7615b2a9a95777" ON "tasks" ("isActive", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6086c8dafbae729a930c04d865" ON "tasks" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bbaf9f0a0d1fb6058a2e52f48" ON "tasks" ("isActive") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bbaf9f0a0d1fb6058a2e52f48"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6086c8dafbae729a930c04d865"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bf318ca48fd7615b2a9a95777"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
  }
}
