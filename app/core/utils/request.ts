import { HttpContext } from "@adonisjs/core/http"
import { find, IFilter, ISort } from "../interfaces/IFilterSort.js"

export interface IFindRequest {
  page: number
  pageSize: number
  fields: string | Array<string>
  filter: Array<IFilter>
  sort: Array<ISort>
}

export async function collectFindRequest(ctx: HttpContext): Promise<any> {
  const qs = ctx.request.qs();
  const page = qs.page ? parseInt(qs.page) : 1;
  const pageSize = qs.page_size ? parseInt(qs.page_size) : 10;
  const fields = qs.fields ? (!Array.isArray(qs.fields) ? qs.fields.split(",") : qs.fields) : ["*"];
  const filter = qs.filter ? JSON.parse(decodeURIComponent(qs.filter)) : [];
  const sort = qs.sort ? JSON.parse(decodeURIComponent(qs.sort)) : [];

  const findObject = {
    page: page,
    pageSize: pageSize,
    fields: fields,
    filter: filter,
    sort: sort
  }

  const findPayload = await find.validate(findObject);
  return findPayload;
}

export async function simpleRequest({field, filters, order}: {field?: string, filters?: any, order?: any}): Promise<any> {
  const fields = field ? (!Array.isArray(field) ? field.split(",") : field) : ["*"];

  const findObject = {
    page: 1,
    pageSize: 100,
    fields: fields,
    filter: (filters ?? []),
    sort: (order ?? [])
  }

  const findPayload = await find.validate(findObject);
  return findPayload;
}
