import { Attendance } from '#models/attendance';
import { AttendanceDetail } from '#models/attendance_detail';
import { Employee } from '#models/employee';
import { DateTime } from 'luxon';

/* 6 = Saturday, 7 = Sunday */
function isWeekend(date: DateTime): boolean {
  const dayOfWeek = date.weekday;
  return dayOfWeek === 6 || dayOfWeek === 7;
}

function generateDateRange(startDate: string, endDate: string): DateTime[] {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const dates: DateTime[] = [];

  let current = start;
  while (current <= end) {
    dates.push(current);
    current = current.plus({ days: 1 });
  }

  return dates;
}

export async function findDateRange() {

  const minDateResult = await Attendance.query()
    .orderBy('attendance_date', 'asc')
    .first();

  const maxDateResult = await Attendance.query()
    .orderBy('attendance_date', 'desc')
    .first();

  let startDate: string | null = null
  let endDate: string | null = null

  if (minDateResult && minDateResult.attendance_date) {
    startDate = DateTime.fromJSDate(new Date(minDateResult.attendance_date.toString())).minus({ days: 1 }).toISODate();
  }

  if (maxDateResult && maxDateResult.attendance_date) {
    endDate = DateTime.fromJSDate(new Date(maxDateResult.attendance_date.toString())).toISODate();
  }

  if (!startDate && !endDate) {
    const today = DateTime.now().toISODate();
    return {
      start_date: today,
      end_date: today,
      message: 'No attendance data found. Using current date as default.'
    }
  }

  return {
    start_date: startDate,
    end_date: endDate,
  }
}

export async function getTodayAttendanceStatus() {
  const today = DateTime.now()
  const todayFormatted = today.toISODate()

  const attendanceRecord = await Attendance.query().where('attendance_date', todayFormatted).first()

  let exist = false
  let present = 0
  let absent = 0

  if (attendanceRecord) {
    exist = true
    present = attendanceRecord.total_present || 0
    absent = attendanceRecord.total_absent || 0
  }

  return {
    exist: exist,
    present: present,
    absent: absent,
    date: todayFormatted,
  }
}

export async function getDailyAttendanceTrend(startDate: string, endDate: string) {

  const activeEmployeesQuery = await Employee.query()
    .where('is_deleted', false)
    .count('* as count')
    .first();

  const totalActiveEmployees = Number(activeEmployeesQuery?.$extras.count || 0);

  const dbData = await Attendance.query()
    .whereBetween('attendance_date', [startDate, endDate])
    .orderBy('attendance_date', 'asc')
    .select('attendance_date', 'total_present', 'total_absent');

  const dateRange = generateDateRange(startDate, endDate);
  const attendanceMap = new Map(
    dbData.map(item => [item.attendance_date.toFormat('yyyy-MM-dd'), item])
  );

  return dateRange.filter(date => !isWeekend(date)).map(date => {
    const dateStr = date.toFormat('yyyy-MM-dd');
    const record = attendanceMap.get(dateStr);

    if (!record) {
      return {
        date: dateStr,
        present: 0,
        absent: totalActiveEmployees
      };
    }

    const presentCount = Math.min(record.total_present, totalActiveEmployees);
    const absentCount = Math.min(totalActiveEmployees - presentCount, totalActiveEmployees);

    return {
      date: dateStr,
      present: presentCount,
      absent: absentCount
    };
  });
}

export async function getAbsenteeismByDepartment(startDate: string, endDate: string) {
  const employeesByDept = await Employee.query()
    .where('is_deleted', false)
    .groupBy('department')
    .count('* as total_employees')
    .select('department');

  const departmentMap = new Map(employeesByDept.map(d => [d.department, d.$extras.total_employees]));

  const weekdays = generateDateRange(startDate, endDate).filter(date => !isWeekend(date)).length;

  const absentCounts = await AttendanceDetail.query()
    .join('employees', 'attendance_details.employee_id', 'employees.id')
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .where('employees.is_deleted', false)
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .groupBy('employees.department')
    .select('employees.department')
    .countDistinct('attendance_details.employee_id as absent_employees')
    .where(query => {
      query.whereNotNull('attendance_details.reason').orWhereNull('attendance_details.presence_time');
    });

  const allAttendance = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .join('employees', 'attendance_details.employee_id', 'employees.id')
    .where('employees.is_deleted', false)
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .select(
      'employees.department',
      'attendances.attendance_date',
      'attendance_details.employee_id'
    )

  // Create a map of attendance records by department and date
  const attendanceByDeptDate = new Map();
  allAttendance.forEach(record => {
    const atDate = DateTime.fromFormat(new Date(record.$extras.attendance_date).toISOString().split('T')[0], 'yyyy-MM-dd');
    const key = `${record.$extras.department}_${atDate.toFormat('yyyy-MM-dd')}`;
    if (!attendanceByDeptDate.has(key)) {
      attendanceByDeptDate.set(key, new Set());
    }

    attendanceByDeptDate.get(key).add(record.employee_id);
  });

  const absenteeismRates = absentCounts.map(dept => {
    const department = dept.$extras.department;
    const totalEmployees = Number(departmentMap.get(department) || 0);
    let totalAbsences = Number(dept.$extras.absent_employees);

    generateDateRange(startDate, endDate).filter(date => !isWeekend(date)).forEach(date => {
      const dateStr = date.toFormat('yyyy-MM-dd');
      const key = `${department}_${dateStr}`;
      const presentEmployees = attendanceByDeptDate.get(key)?.size || 0;
      if (presentEmployees < totalEmployees) {
        totalAbsences += (totalEmployees - presentEmployees);
      }
    });

    const absenteeismRate = totalEmployees > 0
      ? (totalAbsences / (totalEmployees * weekdays)) * 100
      : 0;

    return {
      department,
      absent_employee_count: totalAbsences,
      total_employees_dept: totalEmployees,
      absenteeism_rate: parseFloat(absenteeismRate.toFixed(2))
    };
  });

  return absenteeismRates;
}

export async function getTopAbsenceReasons(startDate: string, endDate: string) {
  const weekdays = generateDateRange(startDate, endDate).filter(date => !isWeekend(date));

  const explicitReasons = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .whereNotNull('reason')
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .groupBy('reason')
    .count('* as count')
    .select('reason')
    .orderBy('count', 'desc');

  const allEmployees = await Employee.query()
    .where('is_deleted', false)
    .count('* as count')
    .first();

  const totalEmployees = Number(allEmployees?.$extras.count || 0);

  // Get actual attendance records for each date
  const attendanceByDate = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .select('attendances.attendance_date')
    .count('* as count')
    .groupBy('attendances.attendance_date');

  // Calculate missing records
  let missingRecordsCount = 0;
  weekdays.forEach(date => {
    const dateStr = date.toFormat('yyyy-MM-dd');
    const recordForDate = attendanceByDate.find(
      record => DateTime.fromFormat(new Date(record.$extras.attendance_date).toISOString().split('T')[0], 'yyyy-MM-dd').toFormat('yyyy-MM-dd') === dateStr
    );
    const presentCount = recordForDate ? Number(recordForDate.$extras.count) : 0;
    if (presentCount < totalEmployees) {
      missingRecordsCount += (totalEmployees - presentCount);
    }
  });

  // Combine explicit reasons with missing records
  const reasons = explicitReasons.map(r => ({
    reason: r.reason,
    count: Number(r.$extras.count)
  }));

  if (missingRecordsCount > 0) {
    reasons.push({
      reason: 'No Record (Absent)',
      count: missingRecordsCount
    });
  }

  // Sort by count in descending order
  return reasons.sort((a, b) => b.count - a.count);
}

export async function getOverallAttendancePercentage(startDate: string, endDate: string) {
  // Get all weekdays in the range
  const weekdays = generateDateRange(startDate, endDate).filter(date => !isWeekend(date));

  // Get total number of employees
  const totalEmployeesQuery = await Employee.query()
    .where('is_deleted', false)
    .count('* as count')
    .first();

  const totalEmployees = Number(totalEmployeesQuery?.$extras.count || 0);
  const totalPossibleAttendance = totalEmployees * weekdays.length;

  // Get actual present records
  const presentRecords = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .whereNotNull('presence_time')
    .where(query => {
      query.whereNull('reason').orWhere('reason', 'Present')
    })
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .count('* as count')
    .first();

  const presentCount = presentRecords ? Number(presentRecords.$extras.count) : 0;

  // Calculate total absences (including missing records)
  const absentCount = totalPossibleAttendance - presentCount;

  if (totalPossibleAttendance === 0) {
    return {
      percentage: 0,
      present_records: 0,
      absent_records: 0,
      total_working_days: 0,
      total_employees: totalEmployees
    };
  }

  const percentage = (presentCount / totalPossibleAttendance) * 100;

  return {
    percentage: parseFloat(percentage.toFixed(2)),
    present_records: presentCount,
    absent_records: absentCount,
    total_working_days: weekdays.length,
    total_employees: totalEmployees
  };
}

export async function getTeamAttendanceSummary(startDate: string, endDate: string) {
  const weekdays = generateDateRange(startDate, endDate).filter(date => !isWeekend(date));
  const weekdayDates = weekdays.map(date => date.toFormat('yyyy-MM-dd'));

  const teamMembers = await Employee.query()
    .where('is_deleted', false)
    .select('id', 'name', 'employee_code', 'department', 'supervisor');

  const teamMemberIds = teamMembers.map(e => e.id);
  if (teamMemberIds.length === 0) return [];

  // Get present records
  const presentCounts = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .whereIn('employee_id', teamMemberIds)
    .whereNotNull('presence_time')
    .where('reason', 'Present')
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .groupBy('employee_id')
    .select('employee_id')
    .countDistinct('attendances.attendance_date as present_days');

  // Get all attendance records to check for missing dates
  const allAttendance = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .whereIn('employee_id', teamMemberIds)
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .select('employee_id', 'attendances.attendance_date');

  // Create a map of attendance records by employee and date
  const attendanceByEmployeeDate = new Map();
  allAttendance.forEach(record => {
    const atDate = DateTime.fromFormat(new Date(record.$extras.attendance_date).toISOString().split('T')[0], 'yyyy-MM-dd');
    const key = `${record.employee_id}_${atDate.toFormat('yyyy-MM-dd')}`;
    attendanceByEmployeeDate.set(key, true);
  });

  return teamMembers.map(member => {
    const present = presentCounts.find(p => p.employee_id === member.id);
    const presentDays = present ? Number(present.$extras.present_days) : 0;

    // Calculate absent days including missing records
    let absentDays = 0;
    weekdayDates.forEach(date => {
      const key = `${member.id}_${date}`;
      if (!attendanceByEmployeeDate.has(key)) {
        absentDays++;
      }
    });

    return {
      id: member.id,
      name: member.name,
      employee_code: member.employee_code,
      supervisor: member.supervisor,
      department: member.department,
      present_days: presentDays,
      absent_days: absentDays,
      total_working_days: weekdays.length
    };
  });
}

export async function getEmployeeAttendanceDetails(startDate: string, endDate: string) {
  const details = await AttendanceDetail.query()
    .join('attendances', 'attendance_details.attendance_id', 'attendances.id')
    .join('employees', 'attendance_details.employee_id', 'employees.id')
    .where('employees.is_deleted', false)
    .whereBetween('attendances.attendance_date', [startDate, endDate])
    .orderBy('attendances.attendance_date', 'asc')
    .select(
      'attendance_details.id',
      'attendance_details.employee_code',
      'attendance_details.employee_name',
      'attendance_details.presence_time',
      'attendance_details.reason',
      'attendances.attendance_date'
    )

  return details
}

export async function getLateArrivals(startDate: string, endDate: string, officialStartTime: string = '09:00:00') {
  const lateArrivals = await AttendanceDetail.query()
    .join('employees', 'attendance_details.employee_id', 'employees.id')
    .whereNotNull('attendance_details.presence_time')
    .where("attendance_details.presence_time", ">", officialStartTime)
    .whereBetween('attendance_details.created_at', [startDate, endDate])
    .groupBy('employees.id', 'employees.name', 'employees.department')
    .count('* as late_count')
    .select('employees.id', 'employees.name', 'employees.department')
    .orderBy('late_count', 'desc');

  return lateArrivals.map(item => ({
    employee_id: item.id,
    employee_name: item.$extras.name,
    department: item.$extras.department,
    late_count: Number(item.$extras.late_count)
  }));
}