/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js';

const restRouter = (pattern: string, Controller: any, version: string = "v1") => {
  router.post(`${version}/${pattern}`, [Controller, "store"]).use(middleware.auth());
  router.put(`${version}/${pattern}`, [Controller, "update"]).use(middleware.auth());
  router.get(`${version}/${pattern}/:id`, [Controller, "show"]).use(middleware.auth());
  router.get(`${version}/${pattern}`, [Controller, "index"]).use(middleware.auth());
  router.delete(`${version}/${pattern}`, [Controller, "destroy"]).use(middleware.auth());
}

const AuthController = () => import("#controllers/auth/auth_controller");
router.post("login", [AuthController, "login"]);


/**global_params**/
const GlobalParamsController = () => import("#controllers/global_param_controller");
router.get(`/v2/global-params`, [GlobalParamsController, "index"]).use(middleware.auth());
router.put(`/v2/global-params`, [GlobalParamsController, "update"]).use(middleware.auth());
router.get(`/v2/global-params/:id`, [GlobalParamsController, "show"]).use(middleware.auth());


/**employee**/
const EmployeeController = () => import("#controllers/employee_controller");
restRouter("employees", EmployeeController);


/**attendance**/
const AttendanceController = () => import("#controllers/attendance_controller");
router.get(`/v2/attendances`, [AttendanceController, "index"]).use(middleware.auth());
router.put(`/v2/attendances/submit`, [AttendanceController, "updateAttendanceWithDetail"]).use(middleware.auth());
router.get(`/v2/attendances-reports/months-year`, [AttendanceController, "getAttendanceMonthsYear"]).use(middleware.auth());

/**attendance_details**/
const AttendanceDetailController = () => import("#controllers/attendance_detail_controller");
router.get(`/v2/attendance-details/:date`, [AttendanceDetailController, "getAttendenceDetailByDate"]).use(middleware.auth());


/**report**/
const ReportController = () => import("#controllers/report_controller");
router.get(`/v2/reports/salary/:date`, [ReportController, "getReportSalaryEmployee"]).use(middleware.auth());

/**dashboard**/
router.get('/v2/dashboard/date-range',  [ReportController, "getDateRange"])
router.get('/v2/dashboard/today-attendance',  [ReportController, "getTodayAttendanceStatus"]).use(middleware.auth());
router.get(`/v2/dashboard/late-arrivals`, [ReportController, "getLateArrivals"]).use(middleware.auth());
router.get(`/v2/dashboard/employee-attendance-details`, [ReportController, "getEmployeeAttendanceDetails"]).use(middleware.auth());
router.get(`/v2/dashboard/team-attendance-summary`, [ReportController, "getTeamAttendanceSummary"]).use(middleware.auth());
router.get(`/v2/dashboard/overall-attendance-percentage`, [ReportController, "getOverallAttendancePercentage"]).use(middleware.auth());
router.get(`/v2/dashboard/top-absence-reasons`, [ReportController, "getTopAbsenceReasons"]).use(middleware.auth());
router.get(`/v2/dashboard/absenteeism-by-department`, [ReportController, "getAbsenteeismByDepartment"]).use(middleware.auth());
router.get(`/v2/dashboard/daily-attendance-trend`, [ReportController, "getDailyAttendanceTrend"]).use(middleware.auth());
