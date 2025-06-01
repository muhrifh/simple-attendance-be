import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidServiceException extends Exception {
    code :string = "E_SERVICE_ERROR"
    status: number = 423 
}
