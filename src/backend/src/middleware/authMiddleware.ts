import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';

export interface TokenPayload {
  email: string;
  role: string;
}

// Define a custom interface to extend the Express Request
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có quyền truy cập (Thiếu token)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JwtUtils.verifyToken(token);
    req.user = decoded; // Attach parsed payload to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
  }
  next();
};
