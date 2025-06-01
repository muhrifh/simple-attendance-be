import User from '#models/user'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import EntityPolicy from '../core/base/base_policy.js';
import { inject } from '@adonisjs/core';
import AuthService from '#services/auth/auth_service';

@inject()
export default class StrategyPolicy extends EntityPolicy {
  constructor(protected authService: AuthService) {
    super(authService);
  }

  private permitCheckers(roles: string[], requiredRoles: string[]): boolean {
    if (!requiredRoles.some(role => roles.includes(role))) {
      return false;
    }

    if (requiredRoles.some(role => roles.includes(role))) {
      return true;
    }

    return false
  }

  async show(user: User, authorizedRoles: string[]): Promise<AuthorizerResponse> {
    const roles = await this.authService.getRoles(user.username);
    
    return this.permitCheckers(roles, authorizedRoles);
  }

  async create(user: User, data: any, authorizedRoles: string[]): Promise<AuthorizerResponse> {
    if (data) {
      const roles = await this.authService.getRoles(user.username);
      return this.permitCheckers(roles, authorizedRoles);
    }

    return false;
  }

  async edit(user: User, data: any, authorizedRoles: string[]): Promise<AuthorizerResponse> {
    if (data) {
      const roles = await this.authService.getRoles(user.username);
      return this.permitCheckers(roles, authorizedRoles);
    }

    return false;
  }

  async delete(user: User, data: any, authorizedRoles: string[]): Promise<AuthorizerResponse> {
    if (data) {
      const roles = await this.authService.getRoles(user.username);
      return this.permitCheckers(roles, authorizedRoles);
    }

    return false;
  }
}