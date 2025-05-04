import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeclineReason1695623490000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE invitations
      ADD COLUMN decline_reason TEXT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE invitations
      DROP COLUMN decline_reason
    `);
  }
}
