import db from '@adonisjs/lucid/services/db';

export class Db {
  static default = () => db.connection();
  static query = Db.default();
}
