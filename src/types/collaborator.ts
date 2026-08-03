export interface Permissions {
  viewApplicants?: boolean;
  moveApplicants?: boolean;
  addNotes?: boolean;
  sendMessages?: boolean;
  editProject?: boolean;
  editRoles?: boolean;
  manageCollaborators?: boolean;
}

export interface ProjectGrant {
  id: string;
  collaboratorId: string;
  projectId: string;
  permissions: Permissions;
  grantedAt: string;
  project?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    rolesCount?: number;
    applicantsCount?: number;
  };
}

export type AccessScope = 'all_projects' | 'selected_projects';
export type CollaboratorStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface Collaborator {
  id: string;
  ownerId: string;
  collaboratorUserId: string | null;
  inviteEmail: string;
  status: CollaboratorStatus;
  accessScope: AccessScope;
  globalPermissions: Permissions | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  revokedAt: string | null;
  inviteTokenExpires: string | null;
  createdAt: string;
  updatedAt?: string;
  projectGrants: ProjectGrant[];
  ownerProfile?: {
    id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    companyName?: string;
  };
  collaboratorUser?: {
    id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
}

export interface MyCollaboration extends Collaborator {
  ownerProfile?: {
    id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    companyName?: string;
  };
}

export interface InviteCollaboratorDto {
  inviteEmail: string;
  accessScope: AccessScope;
  globalPermissions?: Permissions;
  projectGrants?: {
    projectId: string;
    permissions: Permissions;
  }[];
}

export interface UpdateCollaboratorDto {
  accessScope?: AccessScope;
  globalPermissions?: Permissions;
  projectGrants?: {
    projectId: string;
    permissions: Permissions;
  }[];
}

export interface AcceptInviteDto {
  token: string;
}

export interface DeclineInviteDto {
  token: string;
}
