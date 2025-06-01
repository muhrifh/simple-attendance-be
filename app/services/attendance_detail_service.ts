import { inject } from "@adonisjs/core";
import { EntityService } from "../core/base/base_service.js";
import { HttpContext } from "@adonisjs/core/http";
import { AttendanceDetail } from "#models/attendance_detail";
import { Attendance } from "#models/attendance";
import { Employee } from "#models/employee";

@inject()
export default class AttendanceDetailService extends EntityService {
  constructor(ctx: HttpContext) {
    super(AttendanceDetail, ctx);
  }

  async findAttendanceDetailsByDate(targetDate: string) {
    const attendanceRecord = await Attendance.query().where('attendance_date', targetDate).first()
    const targetAttendanceId = attendanceRecord ? attendanceRecord.id : null

    const results = await Employee.query()
      .where('employees.is_deleted', false)
      .select(
        'employees.id as employee_id',
        'employees.employee_code',
        'employees.name as employee_name',
        'employees.department',

        'ad.id as attendance_detail_id',
        'ad.attendance_id as detail_attendance_id',
        'ad.presence_time',
        'ad.out_time',  
        'ad.reason'
      )
      .leftJoin('attendance_details as ad', (join) => {
        join.on('employees.id', '=', 'ad.employee_id')
        join.andOnVal('ad.attendance_id', '=', targetAttendanceId)
      })
      .orderBy('employees.name', 'asc')

    const formattedResults = results.map(row => {
      return {
        id: row.$extras.attendance_detail_id,
        attendance_id: row.$extras.detail_attendance_id,
        employee_id: row.$extras.employee_id,
        employee_code: row.$attributes.employee_code,
        employee_name: row.$extras.employee_name || '',
        department: row.$attributes.department || '',
        presence_time: row.$extras.presence_time ? row.$extras.presence_time.substring(0, 5) : '',
        out_time: row.$extras.out_time ? row.$extras.out_time.substring(0, 5) : '',
        reason: row.$extras.reason,
      }
    })

    return {
      rows: formattedResults,
      count: formattedResults.length,
      date: targetDate,
      attendance_id: targetAttendanceId
    }
  }
} 