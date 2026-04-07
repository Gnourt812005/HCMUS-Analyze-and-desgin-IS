import { UserDTO, SignInResponseDTO, SignInDTO, SignUpDTO, UserProfileDTO, ChangePasswordDTO } from '@dormarch/shared';
import { UserDB } from '../database/UserDB';
import { JwtUtils } from '../utils/jwt';

export class User {
  email: string; // PK
  fullName: string;
  password?: string;
  cccd?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
  address?: string;

  constructor(data: Partial<User>) {
    this.email = data.email || '';
    this.fullName = data.fullName || '';
    this.password = data.password;
    this.cccd = data.cccd;
    this.birthday = data.birthday;
    this.gender = data.gender;
    this.phone = data.phone;
    this.address = data.address;
  }

  toDTO(): UserDTO {
    return {
      email: this.email,
      fullName: this.fullName,
      cccd: this.cccd,
      birthday: this.birthday,
      gender: this.gender,
      phone: this.phone,
      address: this.address,
    };
  }

  toUserProfileDTO(): UserProfileDTO {
    return {
      email: this.email,
      fullName: this.fullName,
      cccd: this.cccd,
      birthday: this.birthday,
      gender: this.gender,
      phone: this.phone,
      address: this.address,
    };
  }

  static async signIn(data: SignInDTO): Promise<SignInResponseDTO | null> {
    const userModel = await UserDB.fetchCredentialByEmail(data.email);

    if (!userModel) {
      return null;
    }

    if (userModel.password !== data.password) {
      return null;
    }

    // Generate accurate JWT Token via Utils
    const payload = { email: userModel.email, role: 'customer' };
    const token = JwtUtils.generateToken(payload, '7d');

    return {
      token,
    };
  }

  static async signUp(data: SignUpDTO): Promise<boolean> {
    const exists = await UserDB.checkEmailExists(data.email);
    if (exists) {
      throw new Error('Email đã tồn tại');
    }

    const newUser = new User({
      email: data.email,
      password: data.password,
      fullName: '',
      gender: 'female',
    });

    return await UserDB.insert(newUser);
  }

  static async getProfile(email: string): Promise<UserProfileDTO | null> {
    const userModel = await UserDB.fetchCredentialByEmail(email);
    if (!userModel) return null;
    return userModel.toUserProfileDTO();
  }

  static async updateProfile(email: string, data: UserProfileDTO): Promise<boolean> {
    return await UserDB.update(email, data);
  }

  static async changePassword(email: string, data: ChangePasswordDTO): Promise<boolean> {
    const userModel = await UserDB.fetchCredentialByEmail(email);
    if (!userModel) throw new Error('Không tìm thấy người dùng');

    if (userModel.password !== data.oldPassword) {
      throw new Error('Mật khẩu cũ không chính xác');
    }

    return await UserDB.updatePassword(email, data.newPassword);
  }
}
