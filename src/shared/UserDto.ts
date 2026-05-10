export enum UserRole {
  GUEST = 'GUEST',
  SALE_STAFF = 'SALE_STAFF',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export interface UserDTO {
  email: string;       // Primary Key
  fullName: string;
  role: UserRole;
  cccd?: string;
  birthday?: string;   // ISO Date String
  gender?: string;
  phone?: string;
  address?: string;
  password?: string;
  dormId?: string;
}

export interface SignInDTO {
  email: string;
  password?: string;
}

export interface SignUpDTO {
  email: string;
  password?: string;
}

export interface SignInResponseDTO {
  token: string;
}

export interface UserProfileDTO {
  email: string;
  fullName: string;
  role: UserRole;
  cccd?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
  address?: string;
  dormId?: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
export interface UpdateProfileDTO {
  fullName?: string;
  cccd?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
  address?: string;
  dormId?: string;
}
