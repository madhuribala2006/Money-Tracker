import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const configuredJwtSecret = process.env.JWT_SECRET;
if (
  process.env.NODE_ENV === 'production' &&
  (!configuredJwtSecret || configuredJwtSecret === 'replace_with_a_long_random_secret')
) {
  throw new Error('Set a unique JWT_SECRET before starting the Money Management System in production.');
}
const JWT_SECRET = configuredJwtSecret || 'finora-pro-super-secret-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        name: decoded.name,
      };
      return next();
    } catch (err) {
      // Invalid token
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
  }

  return res.status(401).json({ error: 'Authentication required' });
}

export function generateToken(payload: { userId: string; email: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}
