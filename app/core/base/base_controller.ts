import { HttpContext } from "@adonisjs/core/http";
import { IDataResponse, IResponse } from "../utils/response.js";
import { collectFindRequest } from "../utils/request.js";
import { EntityService } from "./base_service.js";
import EntityPolicy from "./base_policy.js";
import UnAuthorizedException from "#exceptions/unauthorized";
import ICrudValidator from "../interfaces/IValidator.js";
import GlobalValidator from "./base_validator.js";

export default abstract class BaseController {

  constructor(protected service: EntityService, protected Policy: typeof EntityPolicy, protected modelValidator: ICrudValidator) { }

  defaultResponse(result: any) {
    const response = {
      message: "Not Ok",
      success: false,
      data: result
    }

    if (result) {
      response.success = true;
      response.message = "Ok"
    }
    return response;
  }

  async ensureAccess(policy: any, requiredRoles: string[]): Promise<void> {
    if (await policy.denies('show', requiredRoles)) {
      throw new UnAuthorizedException("Access to this resources was denied", {
        code: "E_FORBIDDEN_ACCESS",
        status: 403
      });
    }
  }

  async ensureExecute(policy: any, permission: 'create' | 'edit' | 'delete', data: any, requiredRoles: string[]): Promise<void> {
    if (await policy.denies(permission, data, requiredRoles)) {
      throw new UnAuthorizedException("Access modify to this resources was denied", {
        code: "E_FORBIDDEN_ACCESS",
        status: 403
      });
    }
  }

  async index(ctx: HttpContext): Promise<IDataResponse> {
    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const request = await collectFindRequest(ctx);
    const result = await this.service.find(request.fields, request.filter, request.sort, request.page, request.pageSize);
    
    return this.defaultResponse(result);
  }

  async show({ params, request, bouncer }: HttpContext): Promise<IDataResponse> {
    var policy: any = bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const qsFields: string | undefined = request.qs().fields;
    const fields = qsFields ? (!Array.isArray(qsFields) ? qsFields.split(",") : qsFields) : ["*"];
    const result = await this.service.findById(params.id, fields);

    return this.defaultResponse(result)
  }

  async store(ctx: HttpContext): Promise<IResponse> {
    const data = ctx.request.body();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureExecute(policy, 'create', data, [EntityPolicy.ROLE_ADMIN])

    const payload = await this.modelValidator.createValidator.validate(data);
    const result = await this.service.create(payload, null);
    return this.defaultResponse(result);
  }

  async update(ctx: HttpContext): Promise<IResponse> {
    const data = ctx.request.body();
    var policy: any = ctx.bouncer.with(this.Policy)

    await this.ensureExecute(policy, 'edit', data, [EntityPolicy.ROLE_ADMIN])

    const payload = await this.modelValidator.updateValidator.validate(data);
    const result = await this.service.update(payload, null);
    return this.defaultResponse(result);
  }

  async destroy(ctx: HttpContext): Promise<IResponse> {
    const data = ctx.request.body();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureExecute(policy, 'delete', data, [EntityPolicy.ROLE_ADMIN])

    const globalValidator = new GlobalValidator()

    const payload = await globalValidator.deleteValidator.validate(data);
    const result = await this.service.deleteSoft(payload, null);
    return this.defaultResponse(result);
  }
}
