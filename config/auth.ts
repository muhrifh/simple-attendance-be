import { defineConfig } from '@adonisjs/auth'
import type { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'
import { JwtGuard } from '../app/auth/guards/jwt.js'
import env from '#start/env'
import { sessionUserProvider } from '@adonisjs/auth/session'

const jwtConfig = {
  secret: env.get('APP_KEY'),
}
const userProvider = sessionUserProvider({
  model: () => import('#models/auth/authorized_user'),
})


const authConfig = defineConfig({
  default: 'jwt',
  guards: {
    jwt: (ctx) => {
      return new JwtGuard(ctx, userProvider as any, jwtConfig)
    },
  },

})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}