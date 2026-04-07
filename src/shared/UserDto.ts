export interface UserDTO {
  email: string;       // Primary Key
  fullName: string;
  cccd?: string;
  birthday?: string;   // ISO Date String
  gender?: string;
  phone?: string;
  address?: string;
  password?: string;   // Included only for mock backend usage
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
