import { inject } from '@adonisjs/core';
import AttendanceService from '#services/attendance_service'
import BaseController from '../core/base/base_controller.js';
import AttendanceValidator from "#validators/attendance";
import StrategyPolicy from '#policies/strategy';
import { HttpContext } from '@adonisjs/core/http';
import SalaryReportService from '../boundary/report/salary.js';
import EntityPolicy from '../core/base/base_policy.js';
import GlobalParamService from '#services/global_param_service';
import { findDateRange, getDailyAttendanceTrend, getTeamAttendanceSummary, getTodayAttendanceStatus } from '../boundary/statistics/dashboard.js';
import { getAbsenteeismByDepartment } from '../boundary/statistics/dashboard.js';
import { getEmployeeAttendanceDetails, getLateArrivals, getOverallAttendancePercentage, getTopAbsenceReasons } from '../boundary/statistics/dashboard.js';

@inject()
export default class ReportController extends BaseController {
  constructor(protected service: AttendanceService, protected validator: AttendanceValidator, protected globalParamService: GlobalParamService, protected salaryReportService: SalaryReportService) {
    super(service, StrategyPolicy, validator);
  }

  public async getDateRange() {
    const dateRange = await findDateRange();
    return this.defaultResponse(dateRange);
  }

  public async getTodayAttendanceStatus(ctx: HttpContext) {
    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const todayAttendanceStatus = await getTodayAttendanceStatus();
    return this.defaultResponse(todayAttendanceStatus);
  }

  public async getReportSalaryEmployee(ctx: HttpContext) {
    const { date } = ctx.params;

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const [SALARY_LIMIT, PRESENCE_TIME_LIMIT] = await Promise.all([this.globalParamService.findBaseSalary(), this.globalParamService.findLastPresenceTimeLimit()]);
    
    const salaryReport = await this.salaryReportService.getEmployeeAttendanceReport(date, Number(SALARY_LIMIT), PRESENCE_TIME_LIMIT.toString());
    return this.defaultResponse(salaryReport);
  }

  public async getLateArrivals(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const lateArrivals = await getLateArrivals(request.start_date, request.end_date, request.official_start_time);
    return this.defaultResponse(lateArrivals);
  }

  public async getEmployeeAttendanceDetails(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const empDetails = await getEmployeeAttendanceDetails(request.start_date, request.end_date);
    return this.defaultResponse(empDetails);
  }

  public async getTeamAttendanceSummary(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const teamSum = await getTeamAttendanceSummary(request.start_date, request.end_date);
    return this.defaultResponse(teamSum);
  }

  public async getOverallAttendancePercentage(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const overallAtt = await getOverallAttendancePercentage(request.start_date, request.end_date);
    return this.defaultResponse(overallAtt);
  }

  public async getTopAbsenceReasons(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const topReasons = await getTopAbsenceReasons(request.start_date, request.end_date);
    return this.defaultResponse(topReasons);
  }

  public async getAbsenteeismByDepartment(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const deptAbsence = await getAbsenteeismByDepartment(request.start_date, request.end_date);
    return this.defaultResponse(deptAbsence);
  }

  public async getDailyAttendanceTrend(ctx: HttpContext) {
    const request = await ctx.request.qs();

    var policy: any = ctx.bouncer.with(this.Policy)
    await this.ensureAccess(policy, [EntityPolicy.ROLE_ADMIN])

    const trend = await getDailyAttendanceTrend(request.start_date, request.end_date);
    return this.defaultResponse(trend);
  }
} 