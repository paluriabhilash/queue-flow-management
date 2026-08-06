import { authRepository, AuthRepository, CreateUserData } from '../repositories/auth.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { LoginInput } from '../validators/auth.validator';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  organizationId: string | null;
  organizationName?: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface AuthResult {
  user: UserResponse;
  tokens: AuthTokens;
}

export class AuthService {
  private repo: AuthRepository;

  constructor(repo: AuthRepository = authRepository) {
    this.repo = repo;
  }

  async register(input: CreateUserData): Promise<AuthResult> {
    // 1. Email Uniqueness Check
    const existingUser = await this.repo.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists');
    }

    // 2. Hash Password
    const hashedPassword = await hashPassword(input.password);

    // 3. Create User
    const user = await this.repo.createUser({
      ...input,
      password: hashedPassword,
    });

    // 4. Issue Tokens
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 5. Store Refresh Token Hash
    const refreshTokenHash = await hashPassword(refreshToken);
    await this.repo.storeRefreshTokenHash(user.id, refreshTokenHash);
    await this.repo.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens: { accessToken, refreshToken },
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    // 1. Find User by Email
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password credentials');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    // 2. Verify Password Match
    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password credentials');
    }

    // 3. Issue Tokens
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 4. Store Refresh Token Hash & Update Last Login
    const refreshTokenHash = await hashPassword(refreshToken);
    await this.repo.storeRefreshTokenHash(user.id, refreshTokenHash);
    await this.repo.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens: { accessToken, refreshToken },
    };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await this.repo.removeRefreshToken(userId);
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name || null,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
