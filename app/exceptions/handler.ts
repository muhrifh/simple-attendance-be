import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import _ from 'lodash'
import { Dictionary } from '@adonisjs/lucid/types/querybuilder'

export interface IExceptonError {
  message :string
  status :number
}

export interface IInvalidMessage {
  field : string
  message : string
}


export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  sendStandardMessage(error :IExceptonError,ctx :HttpContext){
    ctx.response.status(error.status).send({
      success : false,
      message : error.message,
      status : error.status
    })
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: IExceptonError, ctx: HttpContext) {

    
    if (error instanceof errors.E_VALIDATION_ERROR) {
      const messages :Array<IInvalidMessage> = error.messages;
      const errors : Dictionary<any> = {};
      _.each(messages,message => {
        if(!errors[message.field]){
          errors[message.field] = [message.message];
        } else{
          errors[message.field].push(message.message);
        }
      });
      ctx.response.status(422).send({
        success : false,
        message : "Validation failed!",
        errors : errors
      })
      return
    }


    if (error.status != 500) {
      this.sendStandardMessage(error,ctx)
      return
    }
    
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
