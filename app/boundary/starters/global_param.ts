import { GlobalParam } from "#models/global_param";
import { randomUUID } from "crypto";

export async function createStarterGlobalParam(trx: any = null): Promise<any> {
  await GlobalParam.create({
    id: randomUUID(),
    key: "BASE_SALARY",
    value: "10000000",
    split_code: "",
    is_editable: true
  }, trx);

  await GlobalParam.create({
    id: randomUUID(),
    key: "LAST_TIME_PRESENT",
    value: "09:00",
    split_code: "",
    is_editable: true
  }, trx);
}

export async function createStarterEmployeeCode(trx: any = null): Promise<any> {
  return await GlobalParam.create({
    id: randomUUID(),
    key: "LAST_EMPLOYEE_CODE",
    value: "EMP-0000",
    split_code: "EMP-",
    is_editable: false
  }, trx);
}