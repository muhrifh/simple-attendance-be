import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
    vine.object({
        username: vine.string().trim().minLength(4),
        password: vine.string().trim().minLength(6)
    })
)