import { inject } from '@adonisjs/core';
import GlobalParamService from '#services/global_param_service'
import BaseController from '../core/base/base_controller.js';
import GlobalParamValidator from "#validators/global_param";
import StrategyPolicy from '#policies/strategy';
import { IResponse } from '../core/utils/response.js';
import { HttpContext } from '@adonisjs/core/http';
import EntityPolicy from '../core/base/base_policy.js';
import UnAuthorizedException from '#exceptions/unauthorized';

@inject()
export default class GlobalParamController extends BaseController {
  constructor(protected service: GlobalParamService, protected validator: GlobalParamValidator) {
    super(service, StrategyPolicy, validator);
  }

  async update(ctx: HttpContext): Promise<IResponse> {
    const data = ctx.request.body();
    var policy: any = ctx.bouncer.with(this.Policy)

    await this.ensureExecute(policy, 'edit', data, [EntityPolicy.ROLE_ADMIN])

    const payload = await this.modelValidator.updateValidator.validate(data);
    if (!payload.is_editable) {
      throw new UnAuthorizedException("Access modify to this resources was denied", {
        code: "E_FORBIDDEN_ACCESS",
        status: 403
      });
    }

    const result = await this.service.update({ id: payload.id, value: payload.value }, null);
    return this.defaultResponse(result);
  }
}