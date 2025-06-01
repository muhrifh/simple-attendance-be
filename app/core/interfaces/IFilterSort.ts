import vine from '@vinejs/vine'

export enum Direction {
    Asc = "asc",
    Desc = "desc"
}

export enum Condition {
    And = "and",
    Or = "or"
}

export enum Operator {
    eq = "=",
    gt = ">",
    gte = ">=",
    lt = "<",
    lte = "<=",
    like = "like",
    ilike = "ilike",
    in = "in"
}

export interface IFilter {
    property: string;
    op: Operator | undefined;
    value: any;
    cond: Condition | undefined;
    children?: any;
}

export interface ISort {
    property: string;
    dir: Direction;
}

export const filterList = vine.compile(
    vine.object({
        wheres: vine.array(vine.object({
            property: vine.string().minLength(1),
            op: vine.enum(["=", "<", ">", "<=", ">=", "in", "like", "ilike"]),
            value: vine.any(),
            cond: vine.enum(["and", "or"]).optional()
        }))
    })
);

export const sortList = vine.compile(
    vine.object({
        orders: vine.array(vine.object({
            property: vine.string().minLength(1),
            dir: vine.enum(["asc", "desc"])
        }))
    })
);

export const find = vine.compile(
    vine.object({
        fields : vine.array(vine.string()),
        page: vine.number().min(1).optional(),
        pageSize: vine.number().min(1).optional(),
        filter: vine.array(vine.object({
            // property: vine.string().minLength(1),
            property: vine.string().optional().nullable(),
            op: vine.enum(["=", "<", ">", "<=", ">=", "in", "like", "ilike"]).optional().nullable(),
            value: vine.any().optional().nullable(),
            cond: vine.enum(["and", "or"]),
            children: vine.any().optional().nullable()
        })).optional(),
        sort: vine.array(vine.object({
            property: vine.string().minLength(1),
            dir: vine.enum(["asc", "desc"])
        })).optional()
    })
)