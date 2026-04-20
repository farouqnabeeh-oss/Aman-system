"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMinRole = hasMinRole;
exports.isAtLeastManager = isAtLeastManager;
exports.isAtLeastAdmin = isAtLeastAdmin;
exports.isSuperAdmin = isSuperAdmin;
const ROLE_RANK = {
    EMPLOYEE: 0,
    MANAGER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};
function hasMinRole(userRole, requiredRole) {
    const userRank = ROLE_RANK[userRole] ?? -1;
    const requiredRank = ROLE_RANK[requiredRole] ?? Infinity;
    return userRank >= requiredRank;
}
function isAtLeastManager(role) {
    return hasMinRole(role, 'MANAGER');
}
function isAtLeastAdmin(role) {
    return hasMinRole(role, 'ADMIN');
}
function isSuperAdmin(role) {
    return role === 'SUPER_ADMIN';
}
//# sourceMappingURL=role-utils.js.map