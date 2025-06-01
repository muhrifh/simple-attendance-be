import { inject } from '@adonisjs/core';
import AttendanceService from '#services/attendance_service'
import BaseController from '../core/base/base_controller.js';
import AttendanceValidator from "#validators/attendance";
import StrategyPolicy from '#policies/strategy';
import EntityPolicy from '../core/base/base_policy.js';
import { HttpContext } from '@adonisjs/core/http';
import { IDataResponse } from '../core/utils/response.js';

@inject()
export default class AttendanceController extends BaseController {
  constructor(protected service: AttendanceService, protected validator: AttendanceValidator) {
    super(service, StrategyPolicy, validator);
  }

  async getAttendanceMonthsYear({ bouncer }: HttpContext): Promise<IDataResponse> {
    var policy: any = bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const result = await this.service.findAttendanceMonthsYear();
    return this.defaultResponse(result)
  }

  async updateAttendanceWithDetail(ctx: HttpContext): Promise<IDataResponse> {
    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const payload = ctx.request.body();
    const result = await this.service.batchSaveAttendance(payload);
    return this.defaultResponse(result)
  }
}