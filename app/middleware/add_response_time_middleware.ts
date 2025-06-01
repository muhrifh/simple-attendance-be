import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon';
import _ from 'lodash';

export default class AddResponseTimeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const start = DateTime.now();
    await next();
    const end = DateTime.now()
    const dur = end.diff(start, "milliseconds").toMillis();
    if (ctx.response.hasContent) {
      const content = ctx.response.getBody();
      const newContent = _.clone(content)
      newContent.time_taken_ms = dur;
      ctx.response.send(newContent);
    }
  }
}