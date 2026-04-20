import type { UserRole } from './enums';
export declare function hasMinRole(userRole: UserRole | string, requiredRole: UserRole | string): boolean;
export declare function isAtLeastManager(role: string): boolean;
export declare function isAtLeastAdmin(role: string): boolean;
export declare function isSuperAdmin(role: string): boolean;
