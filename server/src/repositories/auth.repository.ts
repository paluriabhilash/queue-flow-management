import { PrismaClient, User, RoleEnum } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: RoleEnum;
  organizationId?: string;
}

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isDeleted: false,
      },
      include: {
        organization: true,
        staffProfile: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        organization: true,
        staffProfile: {
          include: {
            branch: true,
            counter: true,
            department: true,
          },
        },
      },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role || RoleEnum.CUSTOMER,
        organizationId: data.organizationId,
      },
      include: {
        organization: true,
        staffProfile: true,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async storeRefreshTokenHash(userId: string, tokenHash: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: tokenHash,
      },
    });
  }

  async removeRefreshToken(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
      },
    });
  }
}

export const authRepository = new AuthRepository();
