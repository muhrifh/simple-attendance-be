import User from "#models/user";
import { EntityService } from "../../core/base/base_service.js"
import hash from "@adonisjs/core/services/hash";
import InvalidServiceException from "#exceptions/invalid_service";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import _ from "lodash";
import { cache } from '../../utils/cache.js';
import AuthorizedUser from "#models/auth/authorized_user";

@inject()
export default class AuthService extends EntityService {

  constructor(protected ctx: HttpContext) {
    super(User, ctx);
  }

  async getRoles(username: string): Promise<string[]> {
    const roles_users = cache.get("roles_" + username)
    if (roles_users) {
      return roles_users;
    }

    const rows = await this.db.query().from("public.user_roles")
      .select("user_roles.id", "roles.id", "roles.name")
      .join("public.roles", "roles.id", "=", "user_roles.role_id")
      .join("public.users", "users.id", "=", "user_roles.user_id")
      .where("users.username", username)
      .andWhere("user_roles.is_deleted", false)

    var user_roles_find = _.map(rows, row => {
      return row.name.toLowerCase();
    });

    cache.set("roles_" + username, user_roles_find)
    return user_roles_find;
  }

  async verify(username: string, password: string) {
    const user = await this.db.from("public.users")
      .select("id", "name", "username", "password", "email")
      .where("username", username)
      .andWhere("is_deleted", false)
      .first();

    if (!user) {
      throw new InvalidServiceException('Invalid credential!')
    }
    const hashed = user.password;
    const verified = await hash.verify(hashed, password);

    if (!verified) {
      throw new InvalidServiceException('Wrong username or password')
    }

    const authUser = new AuthorizedUser();
    authUser.id = user["id"];
    authUser.name = user["name"];
    authUser.username = user["username"];
    authUser.email = user["email"];
    authUser.roles = await this.getRoles(username);

    return authUser;
  }
}