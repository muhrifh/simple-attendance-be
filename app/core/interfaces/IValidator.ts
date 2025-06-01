import { VineValidator } from "@vinejs/vine"

export default interface ICrudValidator {
  createValidator: VineValidator<any, any>
  updateValidator: VineValidator<any, any>
  deleteValidator: VineValidator<any, any>
}