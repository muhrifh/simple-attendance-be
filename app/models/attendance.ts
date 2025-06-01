import { DateTime } from 'luxon'
import EntityModel from '../core/base/base_model.js'
import { column } from '@adonisjs/lucid/orm'

export class Attendance extends EntityModel {
  static table = 'public.attendances'

  @column({ isPrimary: true }) //uuid
  declare id: string

  @column.date() //date
  declare attendance_date: DateTime

  @column() //int
  declare total_present: number

  @column() //int
  declare total_absent: number
}
