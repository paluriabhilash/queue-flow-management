import {
  queueRepository,
  QueueRepository,
  CreateTokenData,
} from '../repositories/queue.repository';
import { branchRepository } from '../repositories/branch.repository';
import { serviceRepository } from '../repositories/service.repository';
import { counterRepository } from '../repositories/counter.repository';
import { TokenStatusEnum } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../utils/jwt';
import { emitQueueEvent } from '../socket/socket.server';
import { SOCKET_EVENTS } from '../socket/socket.events';

export class QueueService {
  private repo: QueueRepository;

  constructor(repo: QueueRepository = queueRepository) {
    this.repo = repo;
  }

  async generateToken(data: CreateTokenData, currentUser?: JwtPayload) {
    // 1. Verify Branch Exists & Active
    const branch = await branchRepository.findBranchById(data.branchId);
    if (!branch || !branch.isActive) {
      throw ApiError.notFound('Branch location not found or inactive');
    }

    // 2. Verify Service Belongs to Branch & Active
    const service = await serviceRepository.findServiceById(data.serviceId);
    if (!service || !service.isActive) {
      throw ApiError.notFound('Service not found or inactive');
    }

    if (service.department.branchId !== data.branchId) {
      throw ApiError.badRequest('Selected service does not belong to this branch location');
    }

    // 3. Find or Create Today's Queue Session
    const queueSession = await this.repo.findOrCreateTodayQueue(data.branchId, data.serviceId);
    if (queueSession.status === 'CLOSED') {
      throw ApiError.badRequest('Queue session for this service is closed for today');
    }

    // 4. Set Customer ID if authenticated customer
    const customerId = currentUser?.role === 'CUSTOMER' ? currentUser.userId : data.customerId;
    const customerName = data.customerName || (currentUser?.role === 'CUSTOMER' ? currentUser.email : undefined);

    // 5. Atomically Generate Token
    const result = await this.repo.createTokenWithAtomicSequence(
      queueSession,
      service.prefix,
      service.avgServiceTimeMins,
      {
        ...data,
        customerId,
        customerName,
      }
    );

    // 6. Emit Real-time Socket Event
    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_CREATED, result, {
      branchId: data.branchId,
      serviceId: data.serviceId,
    });

    return result;
  }

  async getMyActiveTokens(currentUser: JwtPayload) {
    if (!currentUser || !currentUser.userId) {
      throw ApiError.unauthorized('Authentication required to view tickets');
    }

    return await this.repo.findActiveTokensByCustomer(currentUser.userId);
  }

  async getTokenPosition(tokenId: string) {
    const token = await this.repo.findTokenById(tokenId);
    if (!token) {
      throw ApiError.notFound('Token not found');
    }

    const positionInfo = await this.repo.calculateQueuePosition(tokenId);
    return {
      token,
      ...positionInfo,
    };
  }

  async getCounterDashboard(counterId: string, currentUser: JwtPayload) {
    const dashboardData = await this.repo.getCounterDashboardData(counterId);
    if (!dashboardData) {
      throw ApiError.notFound('Counter desk not found');
    }

    // Authorization Scope Check
    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== dashboardData.counter.branch.organizationId
    ) {
      throw ApiError.forbidden('Access denied to this counter dashboard');
    }

    return dashboardData;
  }

  async callNextToken(counterId: string, currentUser: JwtPayload) {
    // 1. Verify Counter Exists
    const counter = await counterRepository.findCounterById(counterId);
    if (!counter) {
      throw ApiError.notFound('Counter desk not found');
    }

    // 2. Authorization Check
    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== counter.branch.organizationId
    ) {
      throw ApiError.forbidden('You do not have permission to operate this counter');
    }

    if (currentUser.role === 'STAFF') {
      const staffProfile = counter.staffProfile;
      if (!staffProfile || staffProfile.userId !== currentUser.userId) {
        throw ApiError.forbidden('You are not assigned as the operator for this counter');
      }
    }

    // 3. Find Next Highest Priority Waiting Token
    const nextToken = await this.repo.findNextWaitingTokenForCounter(counterId);
    if (!nextToken) {
      throw ApiError.badRequest('No waiting tokens available for this counter');
    }

    // 4. Update Token Status to CALLED & set CalledAt
    const updatedToken = await this.repo.updateTokenStatus(
      nextToken.id,
      TokenStatusEnum.CALLED,
      currentUser.userId,
      {
        counterId,
        calledAt: new Date(),
      },
      `Called by ${currentUser.role} at Counter ${counter.number}`
    );

    // 5. Emit Real-time Socket Event
    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_CALLED, updatedToken, {
      branchId: counter.branchId,
      serviceId: nextToken.serviceId,
      counterId: counter.id,
    });

    return updatedToken;
  }

  async startService(tokenId: string, currentUser: JwtPayload) {
    const token = await this.repo.findTokenById(tokenId);
    if (!token) {
      throw ApiError.notFound('Token not found');
    }

    if (token.status !== TokenStatusEnum.CALLED && token.status !== TokenStatusEnum.WAITING) {
      throw ApiError.badRequest(`Cannot start service for token in ${token.status} status`);
    }

    const updatedToken = await this.repo.updateTokenStatus(
      tokenId,
      TokenStatusEnum.SERVING,
      currentUser.userId,
      {
        servedAt: new Date(),
      },
      'Customer arrived at counter, service started'
    );

    // Emit Real-time Socket Event
    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_STARTED, updatedToken, {
      branchId: token.queue.branchId,
      serviceId: token.serviceId,
      counterId: token.counterId || undefined,
    });

    return updatedToken;
  }

  async completeService(tokenId: string, currentUser: JwtPayload) {
    const token = await this.repo.findTokenById(tokenId);
    if (!token) {
      throw ApiError.notFound('Token not found');
    }

    if (token.status !== TokenStatusEnum.SERVING && token.status !== TokenStatusEnum.CALLED) {
      throw ApiError.badRequest(`Cannot complete token in ${token.status} status`);
    }

    const updatedToken = await this.repo.updateTokenStatus(
      tokenId,
      TokenStatusEnum.COMPLETED,
      currentUser.userId,
      {
        completedAt: new Date(),
      },
      'Service completed successfully'
    );

    // Emit Real-time Socket Event
    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_COMPLETED, updatedToken, {
      branchId: token.queue.branchId,
      serviceId: token.serviceId,
      counterId: token.counterId || undefined,
    });

    return updatedToken;
  }

  async skipToken(tokenId: string, currentUser: JwtPayload) {
    const token = await this.repo.findTokenById(tokenId);
    if (!token) {
      throw ApiError.notFound('Token not found');
    }

    if (token.status !== TokenStatusEnum.CALLED && token.status !== TokenStatusEnum.WAITING) {
      throw ApiError.badRequest(`Cannot skip token in ${token.status} status`);
    }

    const updatedToken = await this.repo.updateTokenStatus(
      tokenId,
      TokenStatusEnum.SKIPPED,
      currentUser.userId,
      undefined,
      'Customer no-show, token skipped'
    );

    // Emit Real-time Socket Event
    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_SKIPPED, updatedToken, {
      branchId: token.queue.branchId,
      serviceId: token.serviceId,
      counterId: token.counterId || undefined,
    });

    return updatedToken;
  }

  async cancelToken(tokenId: string, currentUser: JwtPayload) {
    const token = await this.repo.findTokenById(tokenId);
    if (!token) {
      throw ApiError.notFound('Token not found');
    }

    // Customer can only cancel their own token
    if (currentUser.role === 'CUSTOMER' && token.customerId !== currentUser.userId) {
      throw ApiError.forbidden('You can only cancel your own token');
    }

    if (token.status === TokenStatusEnum.COMPLETED || token.status === TokenStatusEnum.CANCELLED) {
      throw ApiError.badRequest(`Cannot cancel token in ${token.status} status`);
    }

    const updatedToken = await this.repo.updateTokenStatus(
      tokenId,
      TokenStatusEnum.CANCELLED,
      currentUser.userId,
      {
        cancelledAt: new Date(),
      },
      'Token cancelled'
    );

    // Emit Real-time Socket Event
    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_CANCELLED, updatedToken, {
      branchId: token.queue.branchId,
      serviceId: token.serviceId,
      counterId: token.counterId || undefined,
    });

    return updatedToken;
  }

  async getBranchDisplayBoardData(branchId: string) {
    const displayData = await this.repo.getBranchDisplayBoardData(branchId);
    if (!displayData) {
      throw ApiError.notFound('Branch location not found');
    }
    return displayData;
  }

  async deleteToken(tokenId: string, currentUser?: JwtPayload) {
    const token = await this.repo.findTokenById(tokenId);
    if (!token) {
      throw ApiError.notFound('Token not found');
    }

    if (currentUser && currentUser.role === 'CUSTOMER' && token.customerId !== currentUser.userId) {
      throw ApiError.forbidden('You can only delete your own ticket tokens');
    }

    const deletedToken = await this.repo.deleteToken(tokenId);

    emitQueueEvent(SOCKET_EVENTS.QUEUE_TOKEN_DELETED, { id: tokenId }, {
      branchId: token.queue.branchId,
      serviceId: token.serviceId,
    });

    return deletedToken;
  }
}

export const queueService = new QueueService();
