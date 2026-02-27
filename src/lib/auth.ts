import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  role: 'customer' | 'admin';
  jti: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

const auth = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getBearerToken
};

export default auth;
