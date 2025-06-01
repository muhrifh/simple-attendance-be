import vine from '@vinejs/vine'
import ICrudValidator from '../core/interfaces/IValidator.js'

export default class AttendanceValidator implements ICrudValidator {
  createValidator = vine.compile(
    vine.object({
      attendance_date: vine.date(),
      total_present: vine.number(),
      total_absent: vine.number()
    })
  )

  updateValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid(),
      attendance_date: vine.date().optional(),
      total_present: vine.number().optional(),
      total_absent: vine.number().optional()
    })
  )

  deleteValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid()
    })
  )
} 