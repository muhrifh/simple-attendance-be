import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export default class UserRole extends EntityModel {

  static table = 'public.user_roles'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column() //uuid
  declare user_id: string

  @column() //uuid
  declare role_id: string

}
