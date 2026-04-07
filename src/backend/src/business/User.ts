import { UserDTO, SignInResponseDTO, SignInDTO, SignUpDTO } from '@dormarch/shared';
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

    const newUserModel = new User({
      email: data.email,
      password: data.password,
      fullName: '',
      cccd: undefined,
      birthday: undefined,
      gender: 'female',
      phone: undefined,
      address: ''
    });

    return await UserDB.insert(newUserModel);
  }
}
