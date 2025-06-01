import { BaseModel, column } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";
import { SnakeCaseNamingStrategy } from "@adonisjs/lucid/orm";

export class AuditModel extends BaseModel {

  public static namingStrategy = new SnakeCaseNamingStrategy()

  @column({ columnName: "created_by" })
  declare created_by: string

  @column({ columnName: "updated_by" })
  declare updated_by: string

  @column.dateTime({ columnName: "created_at", autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ columnName: "updated_at", autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}

export default class EntityModel extends AuditModel {

  static connection = "default"

  @column({ columnName: "is_deleted" })
  declare is_deleted: boolean
} 
