import { Exception } from '@adonisjs/core/exceptions'

export default class NotFoundException extends Exception {
  status = 404
  code = 'E_NOTFOUND'
}
