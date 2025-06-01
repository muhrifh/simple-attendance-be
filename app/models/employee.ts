import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export class Employee extends EntityModel {
  static table = 'public.employees'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column() 
  declare employee_code: string

  @column() 
  declare name: string

  @column() 
  declare position: string

  @column() 
  declare department: string

  @column() 
  declare supervisor: string
}
