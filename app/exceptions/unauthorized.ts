import { Exception } from '@adonisjs/core/exceptions'

export default class UnAuthorizedException extends Exception {
    status = 401
    code = 'E_UNAUTHORIZED'
}
