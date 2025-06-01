import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export default class Role extends EntityModel {

  static table = 'public.roles'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column() 
  declare name: string

  @column() 
  declare description: string

}
