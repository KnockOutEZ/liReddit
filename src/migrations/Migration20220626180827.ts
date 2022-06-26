import { Migration } from '@mikro-orm/migrations';

export class Migration20220626180827 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "jwt" text not null;');
    this.addSql('alter table "user" add constraint "user_jwt_unique" unique ("jwt");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_jwt_unique";');
    this.addSql('alter table "user" drop column "jwt";');
  }

}
