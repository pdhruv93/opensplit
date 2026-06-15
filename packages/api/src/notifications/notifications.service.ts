import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListNotificationsQueryDto, currentUserId: string) {
    const where: Prisma.NotificationWhereInput = {
      userId: currentUserId,
    };

    if (query.updated_after) {
      where.createdAt = { gte: new Date(query.updated_after) };
    }

    const limit = query.limit || 50;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picture: true,
          },
        },
      },
    });
  }

  async create(data: {
    userId: string;
    type: number;
    content: string;
    sourceType?: string;
    sourceId?: string;
    createdById?: string;
  }) {
    return this.prisma.notification.create({ data });
  }
}
