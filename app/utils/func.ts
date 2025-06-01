export function mutateIsDeleted(arr: any[]) {
  if (!arr || arr.length == 0) return []

  arr.forEach(item => {
    delete item?.created_at;
    delete item?.is_deleted;
  });
  return arr;
}

interface IFilterColumns {
  property: string;
  op: "=" | "<" | ">" | "<=" | ">=" | "in" | "like" | "ilike";
  value: any;
  cond?: any;
}

export function safeJsonParse(str: string) {
  try {
    const parsed = JSON.parse(str);
    return parsed;
  }
  catch (error) {
    return str;
  }
}

export function makeFilters(columns: Array<IFilterColumns>) {
  return columns.map((v, i: number) => ({
    property: v.property,
    value: v.value,
    op: v.op,
    cond: i === 0 ? "and" : (v.cond ?? "or")
  }))
}

export function isEmptyData(data: any) {
  if (data === null || data === undefined || !data) {
    return true;
  }
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  if (typeof data === 'object') {
    return Object.keys(data).length === 0;
  }
  return false;
}

export function extractResponseFind(data: any) {
  return data?.rows ?? [];
}

export function extractResponseById(data: any) {
  return data?.rows?.[0] ?? {};
}

export function makeUniqueArray(rows: any, key: string) {
  const uniqueRows = new Map();
  rows.forEach((item: any) => { uniqueRows.set(item[key], item) });

  return Array.from(uniqueRows.values());
}
