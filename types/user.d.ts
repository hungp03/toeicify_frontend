export interface UpdateUserRequest {
    fullName: string;
    username: string;
    email: string;
    examDate?: string;
    targetScore?: number;
}

export interface AdminUpdateUser {
      userId: number;
      username: string;
      email: string;
      fullName: string;
      isActive: boolean;
      registrationDate: string;
      targetScore?: number;
      examDate?: string;
      roleId?: string;
      roleName?: string;
}