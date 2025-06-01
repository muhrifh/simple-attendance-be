import { IFilter, ISort, Operator } from "../interfaces/IFilterSort.js";

import { DatabaseQueryBuilderContract } from "@adonisjs/lucid/types/querybuilder";
import EntityModel from "./base_model.js";
import { DateTime } from "luxon";
import { HttpContext } from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";
import _ from "lodash";
import env from "#start/env";
import { randomUUID } from "crypto";

export default abstract class BaseService {

    protected db;
    protected con;

    constructor(protected tableName: string, protected ctx: HttpContext
    ) {
        this.db = db;
        this.con = db.connection("default");
    }

    protected getUserName() {
        return (this.ctx.auth.user as any)?.username
    }

    protected async getTransaction(trx: any) {
        var autoCommit = false;
        if (!trx) {
            trx = await this.db.transaction();
            autoCommit = true;
        }
        return {
            autoCommit: autoCommit,
            trx: trx
        }
    }

    protected async exec_transaction(trx: any, fnExec: Function, autoCommit: boolean) {
        var entity: any;
        if (autoCommit) {
            try {
                entity = await fnExec();
                trx.commit();
            } catch (e) {
                trx.rollback();
                throw e;
            }
        } else {
            entity = await fnExec();
        }
        return entity;
    }

    protected buildFilter(q: any, filter: Array<Partial<IFilter>>) {
        q = q.whereRaw("1=1");

        filter.forEach(f => {
            var value = f.value;
            if (f.op == Operator.like) {
                f.op = Operator.ilike;
            }

            if (f.op == Operator.ilike) {
                value = `%${f.value}%`;
            }
            if (f.cond == "or")
                q = q.orWhere(f.property, f.op, value);
            else
                q = q.andWhere(f.property, f.op, value);

        })
        return q;
    }

    protected buildSorter(q: DatabaseQueryBuilderContract, sort: Array<Partial<ISort>>) {
        _.each(sort, (s) => {
            const prop = s.property ?? "";
            if (prop) {
                q = q.orderBy(prop, s.dir)
            }

        })
        return q;
    }

    async countRows(filter: Array<Partial<IFilter>>) {
        var q = this.db.query()
            .from(this.tableName)
            .count("* as total")
        q = this.buildFilter(q, filter);
        let entity = await q;
        if (entity) {
            return parseInt(entity[0].total);
        }
        return 0;
    }

    async countRowsPractices(q: DatabaseQueryBuilderContract<any>, filter: Array<Partial<IFilter>>) {
        var query = q.count("* as total");

        query = this.buildFilter(query, filter);
        let entity = await query;

        if (entity) {
            return parseInt(entity[0].total);
        }

        return 0;
    }

    async find(fields: Array<string>, filter: Array<Partial<IFilter>>, sort: Array<Partial<ISort>>, page: number = 1, pageSize: number = 100) {

        var q = this.db.query().from(this.tableName);
        q = q.select(fields).where(`${this.tableName}.is_deleted`, false)
        q = this.buildFilter(q, filter);
        q = this.buildSorter(q, sort);
        q = q.limit(pageSize);
        const offset = (page - 1) * pageSize;
        q = q.offset(offset);

        const count = await this.countRows(filter);
        const totalPage = Math.ceil(count / pageSize);
        const rows = await q;
        return {
            rows: rows ?? [],
            count: count,
            current: page,
            total_page: totalPage
        }
    }

    async findById(id: any, fields: Array<string> = ["*"]) {
        var q = this.db.from(this.tableName).select(fields).where("id", "=", id).andWhere(`${this.tableName}.is_deleted`, false);
        const result = await q.first();
        return {
            rows: result ? [result] : [],
            count: 1
        }
    }

    async findAll(fields: Array<string>,
        sort: Array<ISort> = [],
        pageSize: number = 1000) {
        return await this.find(fields, [], sort, 1, pageSize);
    }

    async create(data: any, trx: any = null): Promise<any> {
        var { autoCommit, trx } = await this.getTransaction(trx);
        data[env.get("CREATED_AT_FIELD")] = DateTime.local();
        data[env.get("CREATED_BY_FIELD")] = this.getUserName();
        var resultId = null;
        const exec = async () => {
            resultId = await trx.insertQuery({ client: trx }).table(this.tableName).insert(data).returning("id");
            data["id"] = resultId.at(0);
            return data;
        }
        return this.exec_transaction(trx, exec, autoCommit);

    }

    async update(data: any, trx: any = null): Promise<any> {
        var { autoCommit, trx } = await this.getTransaction(trx);
        data[env.get("UPDATED_AT_FIELD")] = DateTime.local();
        data[env.get("UPDATED_BY_FIELD")] = this.getUserName();
        const exec = async () => {
            var query: any = this.db.query;
            await query({ client: trx }).from(this.tableName).where("id", "=", data.id).update(data);
            return data;
        }
        return this.exec_transaction(trx, exec, autoCommit);

    }

    async delete(data: any, trx: any = null): Promise<any> {
        var { autoCommit, trx } = await this.getTransaction(trx);
        const exec = async () => {
            var query: any = this.db.query;
            await query({ client: trx }).from(this.tableName).where("id", "=", data.id).del();
            return data;
        }
        return this.exec_transaction(trx, exec, autoCommit);
    }

    async deleteSoft(data: any, trx: any): Promise<any> {

        var { autoCommit, trx } = await this.getTransaction(trx);

        const exec = async () => {
            var query: any = this.db.query;
            data.is_deleted = 1;
            data[env.get("UPDATED_AT_FIELD")] = DateTime.local();
            data[env.get("UPDATED_BY_FIELD")] = this.getUserName();
            await query({ client: trx }).from(this.tableName).where("id", "=", data.id).update(data);
            return data;
        }

        this.exec_transaction(trx, exec, autoCommit);
    }

}

export class EntityService extends BaseService {

    constructor(protected Model: typeof EntityModel,
        protected ctx: HttpContext) {
        super(Model.table, ctx);
    }

    async create(data: any, trx: any): Promise<EntityModel> {
        var { autoCommit, trx } = await this.getTransaction(trx);

        data.id = randomUUID();
        data.created_at = DateTime.local();
        data.created_by = this.getUserName();
        data.is_deleted = false;
        const exec = async () => {
            var model = new this.Model()
            model.merge(data);
            model.useTransaction(trx);
            await model.save()
            return model;
        }
        return this.exec_transaction(trx, exec, autoCommit);
    }

    async update(data: any, trx: any): Promise<EntityModel> {
        var { autoCommit, trx } = await this.getTransaction(trx);
        const exec = async () => {
            data.updated_at = DateTime.local();
            data.updated_by = this.getUserName();
            const entity = await this.Model.findOrFail(data.id);
            entity.useTransaction(trx);
            await entity.merge(data).save();
            return entity;
        }
        return this.exec_transaction(trx, exec, autoCommit);
    }

    async delete(data: any, trx: any): Promise<EntityModel> {
        var { autoCommit, trx } = await this.getTransaction(trx);
        const exec = async () => {
            data.updated_at = DateTime.local();
            data.updated_by = this.getUserName();
            data.is_deleted = true;
            const entity = await this.Model.findOrFail(data.id);
            entity.useTransaction(trx);
            await entity.delete();
        }

        return this.exec_transaction(trx, exec, autoCommit);
    }

    async deleteSoft(data: any, trx: any): Promise<EntityModel> {
        var { autoCommit, trx } = await this.getTransaction(trx);
        const exec = async () => {
            data.updated_at = DateTime.local();
            data.updated_by = this.getUserName();
            data.is_deleted = 1;
            const entity = await this.Model.findOrFail(data.id);
            entity.useTransaction(trx);
            await entity.merge(data).save();
            return entity;
        }

        return this.exec_transaction(trx, exec, autoCommit);
    }

}