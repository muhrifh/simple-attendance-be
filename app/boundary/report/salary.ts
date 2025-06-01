import { Employee } from '#models/employee'
import { AttendanceDetail } from '#models/attendance_detail'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core';

interface EmployeeAttendanceData {
  id: string;
  name: string;
  position: string | null;
  base_salary: number;
  day_present: number; // Number of weekdays employee was present and on time
  day_absent: number;  // For employees with records: total_weekdays - day_present. For "no record": 0
  percentage: number;
  calculated_salary: number;
  attendance: Record<string, boolean>; // Keys are weekday "YYYY-MM-DD" strings
}

interface WeekdaysInfo {
  dates: string[]; // Array of "YYYY-MM-DD" strings for each weekday
  weekend_dates: string[]; // Array of "YYYY-MM-DD" strings for each weekend
  count: number;   // Total number of weekdays in the month
}

interface AttendanceReportResult {
  rows: EmployeeAttendanceData[];
  total_working_day: number; // This will be the count of weekdays in the month
}

@inject()
export default class SalaryReportService {

  public async getEmployeeAttendanceReport(monthYear: string, baseSalary: number, lastPresenceTimeLimit: string = "09:00:00"): Promise<AttendanceReportResult> {
    const targetMonth = DateTime.fromFormat(monthYear, 'yyyy-MM');
    if (!targetMonth.isValid) {
      throw new Error('Invalid monthYear format. Please use YYYY-MM.');
    }

    // Step 1: Determine all weekdays in the target month
    const weekdaysInfo = this.findWeekdaysInMonth(targetMonth);

    // If services down, return empty report
    if (!weekdaysInfo || weekdaysInfo.count === 0) {
      return { rows: [], total_working_day: 0 };
    }

    // Step 2: Fetch all employees
    const employees = await Employee.query().select('id', 'employee_code', 'name', 'position').where('is_deleted', false).orderBy('name', 'asc');

    // Step 3: Fetch and process actual attendance details for the month-year.
    // Return map: employeeId (string) -> { dateString (YYYY-MM-DD) -> wasOnTime (boolean) }
    const employeeActualOnTimeMap = await this.gatherEmployeeAttendance(
      targetMonth.startOf('month'),
      targetMonth.endOf('month'),
      lastPresenceTimeLimit
    );

    // Step 4: Process report for each employee based onemployeeActualOnTimeMap
    const reportRows: EmployeeAttendanceData[] = [];
    for (const employee of employees) {
      // Get the specific attendance data by employee id
      const empSpecificActualAttendance = employeeActualOnTimeMap.get(String(employee.id));
      const employeeReportData = this.processOneEmployeeReport(employee, baseSalary, weekdaysInfo, empSpecificActualAttendance);
      reportRows.push(employeeReportData);
    }

    return {
      rows: reportRows,
      total_working_day: weekdaysInfo.count,
    };
  }

  /** Find total weekdays in a month year */
  private findWeekdaysInMonth(targetMonthYear: DateTime): WeekdaysInfo {
    const arrWeekdayDate: string[] = [];
    const arrWeekendDate: string[] = [];
    let currentDate = targetMonthYear.startOf('month');
    const monthEndDate = targetMonthYear.endOf('month');

    // Using Luxon to get the weekday from (Code: 1 for Monday & 7 for Sunday)
    while (currentDate <= monthEndDate) {
      const dayOfWeek = currentDate.weekday;
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        arrWeekdayDate.push(currentDate.toFormat('yyyy-MM-dd'));
      }
      else {
        arrWeekendDate.push(currentDate.toFormat('yyyy-MM-dd'));
      }
      currentDate = currentDate.plus({ days: 1 });
    }

    return { dates: arrWeekdayDate, weekend_dates: arrWeekendDate, count: arrWeekdayDate.length };
  }

  /** Fetch attendance details and processes them into a map indicating employee presence. */
  private async gatherEmployeeAttendance(startDate: DateTime, endDate: DateTime, lastPresenceTimeLimit: string): Promise<Map<string, Map<string, boolean>>> {
    const attendanceDetailsInPeriod = await AttendanceDetail.query()
      .join('public.attendances as pa', 'public.attendance_details.attendance_id', 'pa.id')
      .select('public.attendance_details.employee_id', 'public.attendance_details.presence_time', 'pa.attendance_date as attendance_date')
      .whereBetween('pa.attendance_date', [startDate.toFormat('yyyy-MM-dd'), endDate.toFormat('yyyy-MM-dd')])

    const onTimePresenceMap = new Map<string, Map<string, boolean>>();
    for (const detail of attendanceDetailsInPeriod) {
      const employeeId = String(detail.employee_id);
      let attendanceDate: DateTime = DateTime.fromFormat(new Date(detail.$extras.attendance_date).toISOString().split('T')[0], 'yyyy-MM-dd');
      const dateStr = attendanceDate.toFormat('yyyy-MM-dd');

      if (!onTimePresenceMap.has(employeeId)) {
        onTimePresenceMap.set(employeeId, new Map());
      }
      const dailyPresenceMap = onTimePresenceMap.get(employeeId)!;

      // Check if the employee was present and on-time on this specific date.
      if (detail.presence_time && detail.presence_time <= lastPresenceTimeLimit) {
        dailyPresenceMap.set(dateStr, true);
      }
      else {
        if (dailyPresenceMap.get(dateStr) === undefined) {
          dailyPresenceMap.set(dateStr, false);
        }
      }
    }

    return onTimePresenceMap;
  }

  /** Builds the final report data for a single employee. */
  private processOneEmployeeReport(
    employee: Employee,
    baseSalary: number,
    weekdaysInfo: WeekdaysInfo,
    empSpecificActualAttendance: Map<string, boolean> | undefined
  ): EmployeeAttendanceData {
    const employeeIdStr = String(employee.id);

    let expectedResult = {
      id: employeeIdStr,
      name: employee.name,
      position: employee.position,
      employee_code: employee.employee_code,
      base_salary: baseSalary,
      day_present: 0,
      day_absent: 0,
      percentage: 0,
      calculated_salary: 0,
      attendance: {},
    };

    // Condition for an employee having "no records" processed for the month.
    const hasNoRecordsProcessed = !empSpecificActualAttendance || empSpecificActualAttendance.size === 0;
    if (hasNoRecordsProcessed) {
      return expectedResult;
    }

    let daysPresentOnWeekdays = 0;
    let weekendWorkDays = 0;
    const attendanceStatusForWeekdays: Record<string, boolean> = {};

    // Iterate over all weekdays for the month.
    for (const weekdayDateStr of weekdaysInfo.dates) {
      const wasPresentAndOnTime = empSpecificActualAttendance!.get(weekdayDateStr) === true;
      if (wasPresentAndOnTime) {
        daysPresentOnWeekdays++;
      }
      attendanceStatusForWeekdays[weekdayDateStr] = wasPresentAndOnTime;
    }

    // Iterate over all weekend dates for the month.
    for (const weekendDateStr of weekdaysInfo.weekend_dates) {
      const wasPresentAndOnTime = empSpecificActualAttendance!.get(weekendDateStr) === true;
      if (wasPresentAndOnTime) {
        weekendWorkDays++;
      }
      attendanceStatusForWeekdays[weekendDateStr] = wasPresentAndOnTime;
    }

    const companyTotalWeekdays = weekdaysInfo.count;
    const daysAbsentOnWeekdays = companyTotalWeekdays - daysPresentOnWeekdays;

    const presencePercentage = companyTotalWeekdays > 0 ? (daysPresentOnWeekdays + weekendWorkDays) / companyTotalWeekdays : 0;
    const calculatedSalary = presencePercentage * baseSalary;

    expectedResult.day_present = (daysPresentOnWeekdays + weekendWorkDays);
    expectedResult.day_absent = daysAbsentOnWeekdays;
    expectedResult.percentage = parseFloat(presencePercentage.toFixed(3));
    expectedResult.calculated_salary = parseFloat(calculatedSalary.toFixed(3));
    expectedResult.attendance = attendanceStatusForWeekdays;

    return expectedResult;
  }
}