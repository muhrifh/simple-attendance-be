import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export default class User extends EntityModel {

  static table = 'public.users'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column() 
  declare name: string

  @column() 
  declare username: string

  @column() 
  declare email: string

  @column() 
  declare password: string

}
