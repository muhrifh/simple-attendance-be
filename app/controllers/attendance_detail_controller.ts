import { inject } from '@adonisjs/core';
import AttendanceDetailService from '#services/attendance_detail_service'
import BaseController from '../core/base/base_controller.js';
import AttendanceDetailValidator from "#validators/attendance_detail";
import StrategyPolicy from '#policies/strategy';
import EntityPolicy from '../core/base/base_policy.js';
import { IDataResponse } from '../core/utils/response.js';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class AttendanceDetailController extends BaseController {
  constructor(protected service: AttendanceDetailService, protected validator: AttendanceDetailValidator) {
    super(service, StrategyPolicy, validator);
  }

  async getAttendenceDetailByDate({ bouncer, params }: HttpContext): Promise<IDataResponse> {
    var policy: any = bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const result = await this.service.findAttendanceDetailsByDate(params.date);
    return this.defaultResponse(result)
  }
} 