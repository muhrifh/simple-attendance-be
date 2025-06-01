import vine from '@vinejs/vine'

export default class GlobalValidator {

  deleteValidator = vine.compile(
    vine.object({
      id: vine.string().uuid()
    })
  )
}