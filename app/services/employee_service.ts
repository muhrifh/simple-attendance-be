import { inject } from "@adonisjs/core";
import { EntityService } from "../core/base/base_service.js";
import { HttpContext } from "@adonisjs/core/http";
import { Employee } from "#models/employee";

@inject()
export default class EmployeeService extends EntityService {
  constructor(ctx: HttpContext) {
    super(Employee, ctx);
  }
} 