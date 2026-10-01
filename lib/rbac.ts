export type UserRole = 'director' | 'admin' | 'senior_manager' | 'manager' | 'employee' | 'intern' | 'client';

export interface RolePermissions {
  canDeleteProject: boolean;
  canManageFinance: boolean;
  canAssignTasks: boolean;
  canEditTeamRoster: boolean;
  canViewAllProjects: boolean;
  canTriggerRevisions: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  director: {
    canDeleteProject: true,
    canManageFinance: true,
    canAssignTasks: true,
    canEditTeamRoster: true,
    canViewAllProjects: true,
    canTriggerRevisions: true,
  },
  admin: {
    canDeleteProject: true,
    canManageFinance: true,
    canAssignTasks: true,
    canEditTeamRoster: true,
    canViewAllProjects: true,
    canTriggerRevisions: true,
  },
  senior_manager: {
    canDeleteProject: false,
    canManageFinance: true,
    canAssignTasks: true,
    canEditTeamRoster: true,
    canViewAllProjects: true,
    canTriggerRevisions: true,
  },
  manager: {
    canDeleteProject: false,
    canManageFinance: false,
    canAssignTasks: true,
    canEditTeamRoster: false,
    canViewAllProjects: true,
    canTriggerRevisions: true,
  },
  employee: {
    canDeleteProject: false,
    canManageFinance: false,
    canAssignTasks: false,
    canEditTeamRoster: false,
    canViewAllProjects: false,
    canTriggerRevisions: false,
  },
  intern: {
    canDeleteProject: false,
    canManageFinance: false,
    canAssignTasks: false,
    canEditTeamRoster: false,
    canViewAllProjects: false,
    canTriggerRevisions: false,
  },
  client: {
    canDeleteProject: false,
    canManageFinance: false,
    canAssignTasks: false,
    canEditTeamRoster: false,
    canViewAllProjects: false,
    canTriggerRevisions: true,
  },
};

export function hasPermission(role: string, permission: keyof RolePermissions): boolean {
  const normalizedRole = (role?.toLowerCase() as UserRole) || 'employee';
  return ROLE_PERMISSIONS[normalizedRole]?.[permission] ?? false;
}