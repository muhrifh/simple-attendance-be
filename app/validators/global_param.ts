import vine from '@vinejs/vine'
import ICrudValidator from '../core/interfaces/IValidator.js'

export default class GlobalParamValidator implements ICrudValidator {
  createValidator = vine.compile(
    vine.object({
      key: vine.string().trim(),
      value: vine.string().trim(),
      split_code: vine.string().trim(),
      is_editable: vine.boolean()
    })
  )

  updateValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid(),
      key: vine.string().trim().optional(),
      value: vine.string().trim().optional(),
      split_code: vine.string().trim().optional(),
      is_editable: vine.boolean().optional()
    })
  )

  deleteValidator = vine.compile(
    vine.object({
      id: vine.string().trim().uuid()
    })
  )
} 