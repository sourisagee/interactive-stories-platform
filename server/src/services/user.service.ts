import prisma from '../lib/prisma';
import { prepareUserForCreate } from '../middleware/validation/user.validation';
import type { SignUpData, UpdateUserData } from '../types';

const userSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  static async getUserByEmail(email: string) {
    if (!email) return null;
    return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  static async createUser(data: SignUpData) {
    const prepared = await prepareUserForCreate(data);
    return prisma.user.create({
      data: prepared,
      select: userSelect,
    });
  }

  static async getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  static async getAll() {
    return prisma.user.findMany({ select: userSelect });
  }

  static async update(id: number, data: UpdateUserData) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email.trim().toLowerCase(), NOT: { id } },
      });
      if (existing) return null;
    }
    const updateData: { username?: string; email?: string } = {};
    if (data.username != null) updateData.username = data.username.trim();
    if (data.email != null) updateData.email = data.email.trim().toLowerCase();
    if (Object.keys(updateData).length === 0) return this.getById(id);
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  }

  static async delete(id: number) {
    return prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }
}
