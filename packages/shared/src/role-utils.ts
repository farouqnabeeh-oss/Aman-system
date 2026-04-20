// =============================================================================
// ROLE HIERARCHY UTILITY
// Shared between frontend and backend for consistent permission checks
// =============================================================================

import type { UserRole } from './enums';

const ROLE_RANK: Record<string, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/**
 * Returns true if `userRole` meets or exceeds the `requiredRole` level.
 * e.g. hasMinRole('ADMIN', 'MANAGER') → true
 */
export function hasMinRole(userRole: UserRole | string, requiredRole: UserRole | string): boolean {
  const userRank = ROLE_RANK[userRole as string] ?? -1;
  const requiredRank = ROLE_RANK[requiredRole as string] ?? Infinity;
  return userRank >= requiredRank;
}

export function isAtLeastManager(role: string): boolean {
  return hasMinRole(role, 'MANAGER');
}

export function isAtLeastAdmin(role: string): boolean {
  return hasMinRole(role, 'ADMIN');
}

export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}
