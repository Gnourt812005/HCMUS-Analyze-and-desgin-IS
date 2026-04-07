import jwt from 'jsonwebtoken';
import { TokenPayload } from 'src/middleware/authMiddleware';

export class JwtUtils {
  private static getSecret(): string {
    return process.env.JWT_SECRET || 'fallback_secret_key_for_development';
  }

  /**
   * Sinh ra JWT token cho payload
   */
  static generateToken(payload: TokenPayload, expiresIn: string | number = '7d'): string {
    return jwt.sign(payload, this.getSecret(), { expiresIn: expiresIn as any });
  }

  /**
   * Xác thực và giải mã JWT token (sẽ dùng cho middleware sau này)
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.getSecret()) as TokenPayload;
      // check field in payload
      if (!payload.email || !payload.role) {
        throw new Error('Token không hợp lệ');
      }
      return payload;
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
