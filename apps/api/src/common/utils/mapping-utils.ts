import type { IUserPublic, UserRole, Department } from '@ems/shared';

export function toIUserPublic(u: any): IUserPublic {
  if (!u) return u;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    role: u.role as UserRole,
    department: u.department as Department | null,
    position: u.position,
  };
}
