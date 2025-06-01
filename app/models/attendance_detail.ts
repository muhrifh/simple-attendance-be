import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export class AttendanceDetail extends EntityModel {
  static table = 'public.attendance_details'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column() //uuid
  declare attendance_id: string

  @column() //uuid
  declare employee_id: string

  @column() 
  declare employee_code: string

  @column() 
  declare employee_name: string

  @column() 
  declare presence_time: string | null //Format "HH:mm"

  @column() 
  declare out_time: string | null //Format "HH:mm"

  @column() 
  declare reason: string
}