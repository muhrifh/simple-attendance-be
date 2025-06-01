import AuthService from '#services/auth/auth_service'
import { loginValidator } from '#validators/auth/login'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuthController {

  constructor(private authService: AuthService) {

  }

  async login({ request, auth, response }: HttpContext) {
    const data = request.body()
    const payload = await loginValidator.validate(data);
    const user = await this.authService.verify(payload.username, payload.password)
    const accessToken = await auth.use('jwt').generate(user)
    response.plainCookie("access_token", accessToken.token)
    response.status(200)
    response.send({
      success: true,
      message: "Ok",
      token: accessToken.token
    });
  }
}