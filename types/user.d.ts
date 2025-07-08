export interface UpdateUserRequest {
    fullName: string;
    username: string;
    email: string;
    examDate?: string;
    targetScore?: number;
}
