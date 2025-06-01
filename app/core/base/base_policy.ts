import AuthService from "#services/auth/auth_service";
import { BasePolicy } from "@adonisjs/bouncer";

export default class EntityPolicy extends BasePolicy {

    static ROLE_ADMIN = "admin"
    static ROLE_USER = "user"

    constructor(protected userService : AuthService){
        super()
    }
    
    protected isValidUser(roles : string[]) {
        return roles.indexOf(EntityPolicy.ROLE_USER) != -1;
    }

    protected isAdmin(roles : string[]){
        if (this.isValidUser(roles)) {
            return roles.indexOf(EntityPolicy.ROLE_ADMIN) != -1;
        }
        return false;
    }

    protected isUser(roles : string[]){
        if(!this.isAdmin(roles)){
            return roles.indexOf(EntityPolicy.ROLE_USER) != -1;
        }
        return true;
    }
}
