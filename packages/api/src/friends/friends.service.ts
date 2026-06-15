import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFriendDto } from './dto/create-friend.dto';

const FRIEND_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  picture: true,
  registrationStatus: true,
};

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUserId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: currentUserId }, { friendId: currentUserId }],
      },
      include: {
        user: { select: FRIEND_USER_SELECT },
        friend: { select: FRIEND_USER_SELECT },
      },
    });

    const friends = await Promise.all(
      friendships.map(async (f) => {
        const friendUser =
          f.userId === currentUserId ? f.friend : f.user;
        const balance = await this.computeBalance(
          currentUserId,
          friendUser.id,
        );
        return {
          ...friendUser,
          balance,
          updatedAt: f.updatedAt,
        };
      }),
    );

    return friends;
  }

  async findById(friendUserId: string, currentUserId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId: friendUserId },
          { userId: friendUserId, friendId: currentUserId },
        ],
      },
      include: {
        user: { select: FRIEND_USER_SELECT },
        friend: { select: FRIEND_USER_SELECT },
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend not found');
    }

    const friendUser =
      friendship.userId === currentUserId
        ? friendship.friend
        : friendship.user;
    const balance = await this.computeBalance(currentUserId, friendUser.id);

    return {
      ...friendUser,
      balance,
      updatedAt: friendship.updatedAt,
    };
  }

  async create(dto: CreateFriendDto, currentUserId: string) {
    let friendId = dto.userId;

    if (!friendId && dto.email) {
      let user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        if (!dto.firstName) {
          throw new BadRequestException(
            'firstName is required when adding a friend by email who does not exist',
          );
        }

        const { randomBytes } = await import('crypto');
        user = await this.prisma.user.create({
          data: {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName || null,
            passwordHash: 'pending',
            apiKey: randomBytes(32).toString('hex'),
            registrationStatus: 'INVITED',
          },
        });
      }

      friendId = user.id;
    }

    if (!friendId) {
      throw new BadRequestException('Either userId or email is required');
    }

    if (friendId === currentUserId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Already friends with this user');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        userId: currentUserId,
        friendId,
      },
      include: {
        friend: { select: FRIEND_USER_SELECT },
      },
    });

    return friendship.friend;
  }

  async remove(friendUserId: string, currentUserId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId: friendUserId },
          { userId: friendUserId, friendId: currentUserId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return { success: true };
  }

  private async computeBalance(
    userAId: string,
    userBId: string,
  ): Promise<Array<{ currencyCode: string; amount: string }>> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        deletedAt: null,
        shares: {
          some: { userId: userAId },
        },
        AND: {
          shares: {
            some: { userId: userBId },
          },
        },
      },
      include: {
        shares: {
          where: {
            userId: { in: [userAId, userBId] },
          },
        },
      },
    });

    const balanceByCurrency: Record<string, number> = {};

    for (const expense of expenses) {
      const shareA = expense.shares.find((s) => s.userId === userAId);
      const shareB = expense.shares.find((s) => s.userId === userBId);

      if (!shareA || !shareB) continue;

      const currency = expense.currencyCode;
      if (!balanceByCurrency[currency]) balanceByCurrency[currency] = 0;

      const netA = Number(shareA.paidShare) - Number(shareA.owedShare);
      balanceByCurrency[currency] += netA;
    }

    return Object.entries(balanceByCurrency)
      .filter(([, amount]) => Math.abs(amount) > 0.01)
      .map(([currencyCode, amount]) => ({
        currencyCode,
        amount: amount.toFixed(2),
      }));
  }
}
