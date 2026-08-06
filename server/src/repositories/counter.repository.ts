import { PrismaClient, Counter, CounterStatusEnum, CounterService } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCounterData {
  branchId: string;
  name: string;
  number: number;
  status?: CounterStatusEnum;
}

export interface UpdateCounterData {
  name?: string;
  status?: CounterStatusEnum;
  isActive?: boolean;
}

export class CounterRepository {
  async findCounterById(id: string) {
    return prisma.counter.findUnique({
      where: { id },
      include: {
        branch: {
          include: {
            organization: true,
          },
        },
        staffProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
        },
        counterServices: {
          include: {
            service: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });
  }

  async findCounterByNumber(branchId: string, number: number): Promise<Counter | null> {
    return prisma.counter.findUnique({
      where: {
        branchId_number: {
          branchId,
          number,
        },
      },
    });
  }

  async getCountersByBranch(branchId: string) {
    return prisma.counter.findMany({
      where: { branchId },
      include: {
        staffProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        counterServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async getCountersByOrganization(organizationId: string) {
    return prisma.counter.findMany({
      where: {
        branch: {
          organizationId,
        },
      },
      include: {
        branch: true,
        staffProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        counterServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async getAllCounters() {
    return prisma.counter.findMany({
      include: {
        branch: {
          include: {
            organization: true,
          },
        },
        staffProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        counterServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async createCounter(data: CreateCounterData): Promise<Counter> {
    return prisma.counter.create({
      data: {
        branchId: data.branchId,
        name: data.name,
        number: data.number,
        status: data.status || CounterStatusEnum.CLOSED,
      },
    });
  }

  async updateCounter(id: string, data: UpdateCounterData): Promise<Counter> {
    return prisma.counter.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteCounter(id: string): Promise<Counter> {
    return prisma.counter.update({
      where: { id },
      data: {
        isActive: false,
        status: CounterStatusEnum.CLOSED,
      },
    });
  }

  // --- Staff Assignment ---

  async assignStaffToCounter(counterId: string, staffProfileId: string) {
    // Unassign staff from any previous counter first
    await prisma.staffProfile.update({
      where: { id: staffProfileId },
      data: { counterId },
    });

    return this.findCounterById(counterId);
  }

  async removeStaffFromCounter(counterId: string, staffProfileId: string) {
    await prisma.staffProfile.updateMany({
      where: {
        id: staffProfileId,
        counterId,
      },
      data: {
        counterId: null,
      },
    });

    return this.findCounterById(counterId);
  }

  // --- Service Assignment ---

  async assignServicesToCounter(counterId: string, serviceIds: string[]) {
    // Delete existing counterService mappings and create new ones
    await prisma.$transaction([
      prisma.counterService.deleteMany({
        where: { counterId },
      }),
      prisma.counterService.createMany({
        data: serviceIds.map((serviceId) => ({
          counterId,
          serviceId,
        })),
      }),
    ]);

    return this.getCounterServices(counterId);
  }

  async removeServiceFromCounter(counterId: string, serviceId: string) {
    await prisma.counterService.deleteMany({
      where: {
        counterId,
        serviceId,
      },
    });
  }

  async getCounterServices(counterId: string): Promise<CounterService[]> {
    return prisma.counterService.findMany({
      where: { counterId },
      include: {
        service: true,
      },
    });
  }
}

export const counterRepository = new CounterRepository();
