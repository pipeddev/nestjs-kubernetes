import { Environment } from 'src/environment';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1759196544733 implements MigrationInterface {
  name = 'CreateUserTable1759196544733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${Environment.DB_SCHEMA}"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "${Environment.DB_SCHEMA}"."users"`);
  }
}
