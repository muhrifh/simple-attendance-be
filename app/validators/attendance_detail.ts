import vine from '@vinejs/vine'
import ICrudValidator from '../core/interfaces/IValidator.js'

export default class AttendanceDetailValidator implements ICrudValidator {
  createValidator = vine.compile(
    vine.object({
      attendance_id: vine.string().trim().uuid(),
      employee_id: vine.string().trim().uuid(),
      employee_code: vine.string().trim(),
      employee_name: vine.string().trim(),
      presence_time: vine.string().trim().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
      out_time: vine.string().trim().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
      reason: vine.string().trim().optional()
    })
  )

  updateValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid(),
      attendance_id: vine.string().trim().uuid().optional(),
      employee_id: vine.string().trim().uuid().optional(),
      employee_code: vine.string().trim().optional(),
      employee_name: vine.string().trim().optional(),
      presence_time: vine.string().trim().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:mm format
      out_time: vine.string().trim().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:mm format
      reason: vine.string().trim().optional()
    })
  )

  deleteValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid()
    })
  )
} 