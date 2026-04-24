import { SignJWT, jwtVerify } from 'jose';
import { IJwtPayload } from '@ems/shared';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env['JWT_ACCESS_SECRET'] || 'default-access-secret-change-me'
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env['JWT_REFRESH_SECRET'] || 'default-refresh-secret-change-me'
);

const ACCESS_EXPIRY = process.env['JWT_ACCESS_EXPIRY'] || '1h';

export async function signAccessToken(payload: IJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<IJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as IJwtPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return { sub: payload.sub as string };
  } catch (error) {
    return null;
  }
}
