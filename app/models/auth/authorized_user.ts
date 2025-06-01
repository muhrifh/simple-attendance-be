import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import EntityModel from '../../core/base/base_model.js'

const AuthFinder = withAuthFinder(() => hash.use('bcrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class AuthorizedUser extends compose(EntityModel, AuthFinder) {

  static table = "public.users";

  @column({ isPrimary: true })
  declare id: string

  declare name : string;

  @column()
  declare username: string

  @column()
  declare email: string

  declare roles : Array<string>;
}
