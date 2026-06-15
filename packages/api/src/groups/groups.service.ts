import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.group.findMany({
      where: {
        deletedAt: null,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                picture: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string, currentUserId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isMember = group.members.some((m) => m.userId === currentUserId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const debts = await this.computeGroupDebts(id);

    return { ...group, debts };
  }

  async create(dto: CreateGroupDto, currentUserId: string) {
    const memberIds = new Set([currentUserId, ...(dto.members || [])]);

    return this.prisma.group.create({
      data: {
        name: dto.name,
        groupType: dto.groupType,
        simplifyByDefault: dto.simplifyByDefault,
        members: {
          create: Array.from(memberIds).map((userId) => ({ userId })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                picture: true,
              },
            },
          },
        },
      },
    });
  }

  async softDelete(id: string, currentUserId: string) {
    await this.assertMembership(id, currentUserId);

    return this.prisma.group.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string, currentUserId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isMember = group.members.some((m) => m.userId === currentUserId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.prisma.group.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async addMember(groupId: string, userId: string, currentUserId: string) {
    await this.assertMembership(groupId, currentUserId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.groupMember.create({
      data: { groupId, userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            picture: true,
          },
        },
      },
    });
  }

  async removeMember(
    groupId: string,
    userId: string,
    currentUserId: string,
  ) {
    await this.assertMembership(groupId, currentUserId);

    const hasBalance = await this.userHasBalanceInGroup(groupId, userId);
    if (hasBalance) {
      throw new BadRequestException(
        'Cannot remove user with a non-zero balance',
      );
    }

    return this.prisma.groupMember.delete({
      where: { userId_groupId: { userId, groupId } },
    });
  }

  private async assertMembership(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, deletedAt: null },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }
  }

  private async userHasBalanceInGroup(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    const shares = await this.prisma.expenseShare.findMany({
      where: {
        userId,
        expense: { groupId, deletedAt: null },
      },
      select: { paidShare: true, owedShare: true },
    });

    let net = 0;
    for (const share of shares) {
      net += Number(share.paidShare) - Number(share.owedShare);
    }

    return Math.abs(net) > 0.01;
  }

  private async computeGroupDebts(groupId: string) {
    const shares = await this.prisma.expenseShare.findMany({
      where: {
        expense: { groupId, deletedAt: null },
      },
      select: {
        userId: true,
        paidShare: true,
        owedShare: true,
        expense: { select: { currencyCode: true } },
      },
    });

    const balances: Record<string, Record<string, number>> = {};

    for (const share of shares) {
      const currency = share.expense.currencyCode;
      if (!balances[share.userId]) balances[share.userId] = {};
      if (!balances[share.userId][currency])
        balances[share.userId][currency] = 0;

      balances[share.userId][currency] +=
        Number(share.paidShare) - Number(share.owedShare);
    }

    return Object.entries(balances).map(([userId, currencies]) => ({
      userId,
      balances: Object.entries(currencies).map(([currencyCode, amount]) => ({
        currencyCode,
        amount: amount.toFixed(2),
      })),
    }));
  }
}
