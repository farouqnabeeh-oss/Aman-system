import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { IJwtPayload } from '@ems/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_ACCESS_SECRET'] ?? 'fallback-dev-secret',
    });
  }

  validate(payload: IJwtPayload): IJwtPayload {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: 'Invalid token payload' });
    }
    return payload;
  }
}
