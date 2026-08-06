import { PrismaClient, Branch, WorkingHour, Holiday, DayOfWeekEnum } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateBranchData {
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  timeZone?: string;
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  phone?: string;
  timeZone?: string;
  isActive?: boolean;
}

export interface CreateWorkingHourData {
  branchId: string;
  dayOfWeek: DayOfWeekEnum;
  openTime: string;
  closeTime: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  isClosed?: boolean;
}

export interface UpdateWorkingHourData {
  openTime?: string;
  closeTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  isClosed?: boolean;
}

export interface CreateHolidayData {
  branchId: string;
  name: string;
  date: Date;
  description?: string;
}

export interface UpdateHolidayData {
  name?: string;
  date?: Date;
  description?: string;
}

export class BranchRepository {
  async findBranchById(id: string) {
    return prisma.branch.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        organization: true,
        workingHours: true,
        holidays: true,
        _count: {
          select: {
            departments: true,
            counters: true,
            queues: true,
          },
        },
      },
    });
  }

  async findBranchByCode(organizationId: string, code: string) {
    return prisma.branch.findFirst({
      where: {
        organizationId,
        code: code.toUpperCase(),
        isDeleted: false,
      },
    });
  }

  async getBranchesByOrganization(organizationId: string) {
    return prisma.branch.findMany({
      where: {
        organizationId,
        isDeleted: false,
      },
      include: {
        workingHours: true,
        _count: {
          select: {
            departments: true,
            counters: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBranches() {
    return prisma.branch.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        organization: true,
        _count: {
          select: {
            departments: true,
            counters: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBranch(data: CreateBranchData): Promise<Branch> {
    return prisma.branch.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        code: data.code.toUpperCase(),
        address: data.address,
        phone: data.phone,
        timeZone: data.timeZone || 'UTC',
      },
    });
  }

  async updateBranch(id: string, data: UpdateBranchData): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.timeZone && { timeZone: data.timeZone }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async softDeleteBranch(id: string): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // --- Working Hours ---

  async getWorkingHours(branchId: string): Promise<WorkingHour[]> {
    return prisma.workingHour.findMany({
      where: { branchId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findWorkingHourById(id: string) {
    return prisma.workingHour.findUnique({
      where: { id },
      include: { branch: true },
    });
  }

  async createWorkingHour(data: CreateWorkingHourData): Promise<WorkingHour> {
    return prisma.workingHour.upsert({
      where: {
        branchId_dayOfWeek: {
          branchId: data.branchId,
          dayOfWeek: data.dayOfWeek,
        },
      },
      update: {
        openTime: data.openTime,
        closeTime: data.closeTime,
        lunchStartTime: data.lunchStartTime,
        lunchEndTime: data.lunchEndTime,
        isClosed: data.isClosed ?? false,
      },
      create: {
        branchId: data.branchId,
        dayOfWeek: data.dayOfWeek,
        openTime: data.openTime,
        closeTime: data.closeTime,
        lunchStartTime: data.lunchStartTime,
        lunchEndTime: data.lunchEndTime,
        isClosed: data.isClosed ?? false,
      },
    });
  }

  async updateWorkingHour(id: string, data: UpdateWorkingHourData): Promise<WorkingHour> {
    return prisma.workingHour.update({
      where: { id },
      data: {
        ...(data.openTime && { openTime: data.openTime }),
        ...(data.closeTime && { closeTime: data.closeTime }),
        ...(data.lunchStartTime !== undefined && { lunchStartTime: data.lunchStartTime }),
        ...(data.lunchEndTime !== undefined && { lunchEndTime: data.lunchEndTime }),
        ...(data.isClosed !== undefined && { isClosed: data.isClosed }),
      },
    });
  }

  async deleteWorkingHour(id: string): Promise<WorkingHour> {
    return prisma.workingHour.delete({
      where: { id },
    });
  }

  // --- Holidays ---

  async getHolidays(branchId: string): Promise<Holiday[]> {
    return prisma.holiday.findMany({
      where: { branchId },
      orderBy: { date: 'asc' },
    });
  }

  async findHolidayById(id: string) {
    return prisma.holiday.findUnique({
      where: { id },
      include: { branch: true },
    });
  }

  async createHoliday(data: CreateHolidayData): Promise<Holiday> {
    return prisma.holiday.create({
      data: {
        branchId: data.branchId,
        name: data.name,
        date: data.date,
        description: data.description,
      },
    });
  }

  async updateHoliday(id: string, data: UpdateHolidayData): Promise<Holiday> {
    return prisma.holiday.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.date && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  async deleteHoliday(id: string): Promise<Holiday> {
    return prisma.holiday.delete({
      where: { id },
    });
  }
}

export const branchRepository = new BranchRepository();
