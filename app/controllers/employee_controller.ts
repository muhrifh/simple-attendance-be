import { inject } from '@adonisjs/core';
import EmployeeService from '#services/employee_service'
import BaseController from '../core/base/base_controller.js';
import EmployeeValidator from "#validators/employee";
import StrategyPolicy from '#policies/strategy';
import { HttpContext } from '@adonisjs/core/http';
import { IResponse } from '../core/utils/response.js';
import GlobalParamService from '#services/global_param_service';

@inject()
export default class EmployeeController extends BaseController {
  constructor(protected service: EmployeeService, protected validator: EmployeeValidator, protected globalParamService: GlobalParamService) {
    super(service, StrategyPolicy, validator);
  }

  async store(ctx: HttpContext): Promise<IResponse> {
    const data = ctx.request.body();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureExecute(policy, 'create', data, [StrategyPolicy.ROLE_ADMIN])

    let payload = await this.modelValidator.createValidator.validate(data);
    payload.employee_code = await this.globalParamService.findEmployeeNumber()

    const result = await this.service.create(payload, null);
    return this.defaultResponse(result);
  }
} 
