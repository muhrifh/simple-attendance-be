import { GlobalParam } from "#models/global_param";
import { inject } from "@adonisjs/core";
import { EntityService } from "../core/base/base_service.js";
import { HttpContext } from "@adonisjs/core/http";
import { IFilter, ISort } from "../core/interfaces/IFilterSort.js";
import { createStarterEmployeeCode, createStarterGlobalParam } from "../boundary/starters/global_param.js";

@inject()
export default class GlobalParamService extends EntityService {
  constructor(ctx: HttpContext) {
    super(GlobalParam, ctx);
  }

  async find(fields: Array<string>, filter: Array<Partial<IFilter>>, sort: Array<Partial<ISort>>, page: number = 1, pageSize: number = 100) {
    var q = this.db.query().from(this.tableName);

    q = q.select(fields).where(`${this.tableName}.is_deleted`, false)
    q = this.buildFilter(q, filter);
    q = this.buildSorter(q, sort);
    q = q.limit(pageSize);

    const offset = (page - 1) * pageSize;
    q = q.offset(offset);

    let count = await this.countRows(filter);
    const totalPage = Math.ceil(count / pageSize);
    const rows = await q;

    if (rows.length === 0) {
      const data = await createStarterGlobalParam();
      rows.push(data);
      count = rows.length;
    }

    return {
      rows: rows ?? [],
      count: count,
      current: page,
      total_page: totalPage
    }
  }

  async findEmployeeNumber() {
    let q = this.db.from(this.tableName).select(['*']).where("key", "=", 'LAST_EMPLOYEE_CODE').andWhere(`${this.tableName}.is_deleted`, false);
    let lastEmployeeCode = await q.first();

    if (!lastEmployeeCode) {
      lastEmployeeCode = await createStarterEmployeeCode();
    }

    const numericStringPart = lastEmployeeCode.value.substring(lastEmployeeCode.split_code.length);

    const nextIncrement = parseInt(numericStringPart, 10) + 1;
    const nextNumericStringPart = String(nextIncrement).padStart(4, '0');

    await this.update({ id: lastEmployeeCode.id, value: `${lastEmployeeCode.split_code}${nextNumericStringPart}` }, null);

    return `${lastEmployeeCode.split_code}${nextNumericStringPart}`;
  }

  async findBaseSalary() {
    let q = this.db.from(this.tableName).select(['*']).where("key", "=", 'BASE_SALARY').andWhere(`${this.tableName}.is_deleted`, false);
    let result = await q.first();

    return `${result.value}`;
  }

  async findLastPresenceTimeLimit() {
    let q = this.db.from(this.tableName).select(['*']).where("key", "=", 'LAST_TIME_PRESENT').andWhere(`${this.tableName}.is_deleted`, false);
    let result = await q.first();

    return Number(result.value);
  }
} 