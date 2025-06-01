import { inject } from "@adonisjs/core";
import { EntityService } from "../core/base/base_service.js";
import { HttpContext } from "@adonisjs/core/http";
import { Attendance } from "#models/attendance";
import { DateTime } from "luxon";
import { AttendanceDetail } from "#models/attendance_detail";
import { randomUUID } from "crypto";
import GlobalParamService from "./global_param_service.js";

interface AttendanceDetailPayloadRow {
  id: string | null;
  attendance_id: string | null;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  presence_time: string | undefined | null;
  out_time: string | undefined | null;
  reason: string | undefined | null;
}

interface MasterAttendanceActionResult {
  status: 'UPDATE_MASTER' | 'CREATE_MASTER' | 'ERROR';
  record?: Attendance;
  id?: string;
  dateForCreation?: string;
  errorMessage?: string;
}

interface AttendanceTotals {
  present: number;
  absent: number;
}


@inject()
export default class AttendanceService extends EntityService {
  constructor(ctx: HttpContext, protected globalParamService: GlobalParamService) {
    super(Attendance, ctx);
  }

  public async batchSaveAttendance(payload: any) {
    if (!payload || !payload.date || !Array.isArray(payload.rows)) {
      return { message: 'Invalid payload: "data" object with "date" (YYYY-MM-DD) and "rows" array is required.' }
    }

    const payloadDate: string = payload.date
    const payloadAttendanceId: string | null = payload.attendance_id || null
    const detailRows: AttendanceDetailPayloadRow[] = payload.rows

    var { trx } = await this.getTransaction(trx);

    try {
      // Step 1: Determine Master Attendance Action (CREATE, UPDATE, ERROR)
      const masterAction = await this.determineMasterAttendanceAction(
        payloadDate,
        payloadAttendanceId,
        trx
      )

      if (masterAction.status === 'ERROR') {
        await trx.rollback()
        return { message: masterAction.errorMessage }
      }

      let masterAttendanceRecord: Attendance
      let masterAttendanceId: string

      if (masterAction.status === 'UPDATE_MASTER') {
        // Update existing attendance record
        masterAttendanceRecord = masterAction.record!
        masterAttendanceId = masterAction.id!
        masterAttendanceRecord.useTransaction(trx)
      }
      else {
        // Create new attendance record
        masterAttendanceRecord = new Attendance()
        masterAttendanceRecord.useTransaction(trx)
        masterAttendanceRecord.id = randomUUID()
        masterAttendanceRecord.attendance_date = DateTime.fromFormat(masterAction.dateForCreation!, 'yyyy-MM-dd')
        masterAttendanceRecord.total_present = 0
        masterAttendanceRecord.total_absent = 0
        await masterAttendanceRecord.save()

        masterAttendanceId = masterAttendanceRecord.id
      }

      const lateThresholdTime = await this.globalParamService.findLastPresenceTimeLimit();

      // Step 2: Process Each Employee's Attendance Detail
      for (const detailRow of detailRows) {
        await this.processAttendanceDetailRow(
          detailRow,
          masterAttendanceId,
          String(lateThresholdTime),
          trx
        )
      }

      // Step 3: Recalculate and Update Totals for Master Attendance
      const totals = await this.recalculateAttendanceTotals(masterAttendanceId, trx)
      masterAttendanceRecord.total_present = totals.present
      masterAttendanceRecord.total_absent = totals.absent
      await masterAttendanceRecord.save()

      // Step 4: Commit Transaction
      await trx.commit()

      return {
        message: 'Attendance data batch saved successfully.',
        attendance_id: masterAttendanceId,
        date: payloadDate,
        calculated_total_present: totals.present,
        calculated_total_absent: totals.absent,
      }

    }
    catch (error) {
      await trx.rollback()
      console.error('Critical error during batch save attendance:', error)
      return {
        message: 'Failed to save attendance data due to a critical internal error.',
        error_details: error.message,
      }
    }
  }

  async findAttendanceMonthsYear() {
    const distinctYearMonthRecords = await this.db.from(Attendance.table)
      .select(this.db.raw("TO_CHAR(attendance_date, 'YYYY-MM') as year_month_value"))
      .groupBy('year_month_value')
      .orderBy('year_month_value', 'asc');

    // Transform the database results with Luxon
    const formattedMonths = distinctYearMonthRecords?.map((record) => {
      const yearMonthValue = record.year_month_value as string;
      const dateTimeObject = DateTime.fromFormat(yearMonthValue, 'yyyy-MM');

      return {
        value: yearMonthValue,
        label: dateTimeObject.toFormat('MMMM yyyy'),
      };
    });

    return {
      rows: formattedMonths,
      count: formattedMonths?.length,
    };
  }

  private async determineMasterAttendanceAction(payloadDate: string, payloadAttendanceId: string | null, trx: any): Promise<MasterAttendanceActionResult> {
    
    const existingAttendanceDate = await Attendance.query({ client: trx }).where('attendance_date', payloadDate).first()

    if (existingAttendanceDate) {
      if (payloadAttendanceId && payloadAttendanceId === existingAttendanceDate.id) {
        // UPDATE: Date exists, payload ID matches DB ID.
        return { status: 'UPDATE_MASTER', record: existingAttendanceDate, id: existingAttendanceDate.id }
      } 
      else {
        // ERROR: Date exists, but payload ID is null or mismatched.
        return {
          status: 'ERROR',
          errorMessage: `Attendance for date ${payloadDate} already exists (ID: ${existingAttendanceDate.id}). The provided payload 'attendance_id' ('${payloadAttendanceId}') is missing or incorrect.`,
        }
      }
    } 
    else {
      if (payloadAttendanceId === null) {
        // CREATE: Date new, payload ID is null.
        return { status: 'CREATE_MASTER', dateForCreation: payloadDate }
      } 
      else {
        // ERROR: Date new, but payload ID was provided.
        return {
          status: 'ERROR',
          errorMessage: `Cannot create attendance for new date ${payloadDate} with a provided payload 'attendance_id' ('${payloadAttendanceId}'). For new records, 'attendance_id' at the root of payload must be null.`,
        }
      }
    }
  }

  private async processAttendanceDetailRow(detailRow: AttendanceDetailPayloadRow, attendanceId: string, lateThresholdTime: string, trx: any): Promise<void> {
    const {
      id: detailIdFromPayload,
      employee_id: employeeId,
      employee_code: employeeCodeFromPayload,
      employee_name: employeeNameFromPayload,
    } = detailRow

    let presenceTime: string | null = (detailRow.presence_time === undefined || detailRow.presence_time === null) ? null : detailRow.presence_time
    let outTime: string | null = (detailRow.out_time === undefined || detailRow.out_time === null) ? null : detailRow.out_time
    let reason: string = (detailRow.reason === undefined || detailRow.reason === null) ? 'Undefined Reason' : detailRow.reason

    if (presenceTime && presenceTime > lateThresholdTime &&
      (reason === null || reason.toLowerCase() === "present" || reason.toLowerCase() === "late-present")) {
      reason = 'Late-Present'
    }

    if (detailIdFromPayload) {
      const existingDetailRecord = await AttendanceDetail.query({ client: trx }).where('id', detailIdFromPayload).first()

      if (existingDetailRecord) {
        existingDetailRecord.useTransaction(trx)
        const isDataChanged = (
          existingDetailRecord.presence_time !== presenceTime ||
          existingDetailRecord.out_time !== outTime ||
          existingDetailRecord.reason !== reason ||
          existingDetailRecord.employee_code !== employeeCodeFromPayload ||
          existingDetailRecord.employee_name !== employeeNameFromPayload
        )

        if (isDataChanged) {
          existingDetailRecord.merge({
            presence_time: presenceTime || null,
            out_time: outTime || null,
            reason: reason || '',
            employee_code: employeeCodeFromPayload,
            employee_name: employeeNameFromPayload,
            // attendance_id should already be correct (attendanceId)
          })
          await existingDetailRecord.save()
        }
      }
      else {
        console.warn(`WARNING: AttendanceDetail with id '${detailIdFromPayload}' from payload not found. Skipping update.`)
      }
    }
    else {
      await AttendanceDetail.create({
        id: randomUUID(),
        attendance_id: attendanceId,
        employee_id: employeeId,
        employee_code: employeeCodeFromPayload,
        employee_name: employeeNameFromPayload,
        presence_time: presenceTime || null,
        out_time: outTime || null,
        reason: reason || '',
      }, { client: trx })
    }
  }

  private async recalculateAttendanceTotals(attendanceId: string, trx: any): Promise<AttendanceTotals> {
    const allDetailsForDay = await AttendanceDetail.query({ client: trx }).where('attendance_id', attendanceId)

    let presentCount = 0
    let absentCount = 0

    for (const detail of allDetailsForDay) {
      if (detail.reason.toLowerCase() == 'present') {
        presentCount++
      }
      else if (detail.reason.toLowerCase() != 'present') {
        absentCount++
      }
    }

    return { present: presentCount, absent: absentCount }
  }
} 