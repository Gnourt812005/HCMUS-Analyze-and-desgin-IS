import { UserDTO, SignInResponseDTO, SignInDTO, SignUpDTO, UserProfileDTO, ChangePasswordDTO, UserRole, UpdateProfileDTO } from '@dormarch/shared';
import { UserDB } from '../database/UserDB';
import { JwtUtils } from '../utils/jwt';
import { TokenPayload } from '../middleware/authMiddleware';


export class User {
  email: string; // PK
  fullName: string;
  password?: string;
  cccd?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  dormId?: string;

  constructor(data: Partial<User>) {
    this.email = data.email || '';
    this.fullName = data.fullName || '';
    this.password = data.password;
    this.cccd = data.cccd;
    this.birthday = data.birthday;
    this.gender = data.gender;
    this.phone = data.phone;
    this.address = data.address;
    this.role = data.role || UserRole.GUEST;
    this.dormId = data.dormId;
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
      role: this.role,
      dormId: this.dormId
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
      role: this.role,
      dormId: this.dormId
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
    const payload: TokenPayload = { email: userModel.email, role: userModel.role, dormId: userModel.dormId };
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
      role: UserRole.GUEST
    });

    return await UserDB.insert(newUser);
  }

  static async getProfile(email: string): Promise<UserProfileDTO | null> {
    const userModel = await UserDB.fetchCredentialByEmail(email);
    if (!userModel) return null;
    return userModel.toUserProfileDTO();
  }

  static async getProfileByCCCD(cccd: string): Promise<UserProfileDTO | null> {
    const userModel = await UserDB.fetchByCCCD(cccd);
    if (!userModel) return null;
    return userModel.toUserProfileDTO();
  }

  static async updateProfile(email: string, data: UpdateProfileDTO): Promise<boolean> {
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

  static async getAllEmployees(query: { keyword?: string }): Promise<UserProfileDTO[]> {
    const list = await UserDB.fetchAllStaff(query);
    return list.map(u => u.toUserProfileDTO());
  }

  static async getEmployeeByEmail(email: string): Promise<UserProfileDTO | null> {
    const userModel = await UserDB.fetchCredentialByEmail(email);
    if (!userModel || userModel.role === UserRole.GUEST) return null;
    return userModel.toUserProfileDTO();
  }

  static async upsertEmployee(data: UserDTO): Promise<boolean> {
    if (!data.email) throw new Error('Email là bắt buộc');
    const exists = await UserDB.checkEmailExists(data.email);
    
    if (exists) {
      // Update
      const updateData: UpdateProfileDTO & { role?: UserRole } = { ...data };
      delete (updateData as any).email;
      delete (updateData as any).password;
      
      const success = await UserDB.update(data.email, updateData);
      
      // Update role if changed
      if (data.role) {
        const db = require('../database/DatabaseClient').DatabaseClient.getInstance();
        await db.query('UPDATE users SET role = $1 WHERE email = $2', [data.role, data.email]);
      }
      
      return success;
    } else {
      // Create
      const newUser = new User({
        ...data,
        password: data.password || '123456' // Default password
      });
      return await UserDB.insert(newUser);
    }
  }

  static async deleteEmployee(email: string): Promise<boolean> {
    return await UserDB.delete(email);
  }
}
