import vine from '@vinejs/vine'
import ICrudValidator from '../core/interfaces/IValidator.js'

export default class EmployeeValidator implements ICrudValidator {
  createValidator = vine.compile(
    vine.object({
      name: vine.string().trim(),
      position: vine.string().trim(),
      department: vine.string().trim(),
      supervisor: vine.string().trim()
    })
  )

  updateValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid(),
      name: vine.string().trim().optional(),
      position: vine.string().trim().optional(),
      department: vine.string().trim().optional(),
      supervisor: vine.string().trim().optional()
    })
  )

  deleteValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid()
    })
  )
} 