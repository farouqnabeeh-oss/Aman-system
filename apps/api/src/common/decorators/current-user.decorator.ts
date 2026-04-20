import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { IJwtPayload } from '@ems/shared';

export interface RequestUser {
  id: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const req = ctx.switchToHttp().getRequest<Request & { user: IJwtPayload }>();
    const user: RequestUser = { id: req.user.sub, role: req.user.role };
    return _data ? user[_data] : user;
  },
);
