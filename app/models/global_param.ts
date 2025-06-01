import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export class GlobalParam extends EntityModel {
  static table = 'public.global_params'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column() 
  declare key: string

  @column() 
  declare value: string

  @column() 
  declare split_code: string

  @column() 
  declare is_editable: boolean
}
