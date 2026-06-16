import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';

const EXPENSE_INCLUDE = {
  shares: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          picture: true,
        },
      },
    },
  },
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      picture: true,
    },
  },
  updatedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      picture: true,
    },
  },
  category: true,
};

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListExpensesQueryDto, currentUserId: string) {
    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      shares: { some: { userId: currentUserId } },
    };

    if (query.group_id) {
      where.groupId = query.group_id;
    }

    if (query.friend_id) {
      where.AND = [
        { shares: { some: { userId: currentUserId } } },
        { shares: { some: { userId: query.friend_id } } },
      ];
    }

    if (query.dated_after || query.dated_before) {
      where.date = {};
      if (query.dated_after) where.date.gte = new Date(query.dated_after);
      if (query.dated_before) where.date.lte = new Date(query.dated_before);
    }

    if (query.updated_after || query.updated_before) {
      where.updatedAt = {};
      if (query.updated_after)
        where.updatedAt.gte = new Date(query.updated_after);
      if (query.updated_before)
        where.updatedAt.lte = new Date(query.updated_before);
    }

    const limit = Math.min(query.limit || 20, 100);

    return this.prisma.expense.findMany({
      where,
      include: EXPENSE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: query.offset || 0,
    });
  }

  async findById(id: string, currentUserId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id, deletedAt: null },
      include: {
        ...EXPENSE_INCLUDE,
        comments: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                picture: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const hasAccess = expense.shares.some(
      (s) => s.userId === currentUserId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this expense',
      );
    }

    return expense;
  }

  async create(dto: CreateExpenseDto, currentUserId: string) {
    let shares = dto.shares || [];

    if (dto.splitEqually && dto.groupId) {
      const members = await this.prisma.groupMember.findMany({
        where: { groupId: dto.groupId },
      });

      if (members.length === 0) {
        throw new BadRequestException('Group has no members');
      }

      const perPerson = dto.cost / members.length;
      shares = members.map((m) => ({
        userId: m.userId,
        paidShare: m.userId === currentUserId ? dto.cost : 0,
        owedShare: perPerson,
      }));
    }

    if (shares.length === 0) {
      throw new BadRequestException(
        'Expense must have at least one share. Provide shares or use splitEqually with a groupId.',
      );
    }

    this.validateShares(shares, dto.cost);

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          groupId: dto.groupId || null,
          description: dto.description,
          details: dto.details,
          cost: dto.cost,
          currencyCode: dto.currencyCode,
          categoryId: dto.categoryId,
          date: dto.date ? new Date(dto.date) : new Date(),
          repeatInterval: dto.repeatInterval,
          payment: dto.payment,
          createdById: currentUserId,
          shares: {
            create: shares.map((s) => ({
              userId: s.userId,
              paidShare: s.paidShare,
              owedShare: s.owedShare,
            })),
          },
        },
        include: EXPENSE_INCLUDE,
      });

      return expense;
    });
  }

  async update(
    id: string,
    dto: UpdateExpenseDto,
    currentUserId: string,
  ) {
    const existing = await this.prisma.expense.findUnique({
      where: { id, deletedAt: null },
      include: { shares: true },
    });

    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    const hasAccess = existing.shares.some(
      (s) => s.userId === currentUserId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this expense',
      );
    }

    const cost = dto.cost ?? Number(existing.cost);

    return this.prisma.$transaction(async (tx) => {
      if (dto.shares) {
        this.validateShares(dto.shares, cost);

        await tx.expenseShare.deleteMany({ where: { expenseId: id } });
        await tx.expenseShare.createMany({
          data: dto.shares.map((s) => ({
            expenseId: id,
            userId: s.userId,
            paidShare: s.paidShare,
            owedShare: s.owedShare,
          })),
        });
      }

      return tx.expense.update({
        where: { id },
        data: {
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.details !== undefined && { details: dto.details }),
          ...(dto.cost !== undefined && { cost: dto.cost }),
          ...(dto.currencyCode !== undefined && {
            currencyCode: dto.currencyCode,
          }),
          ...(dto.categoryId !== undefined && {
            categoryId: dto.categoryId,
          }),
          ...(dto.date !== undefined && { date: new Date(dto.date) }),
          ...(dto.repeatInterval !== undefined && {
            repeatInterval: dto.repeatInterval,
          }),
          ...(dto.payment !== undefined && { payment: dto.payment }),
          ...(dto.groupId !== undefined && {
            groupId: dto.groupId || null,
          }),
          updatedById: currentUserId,
        },
        include: EXPENSE_INCLUDE,
      });
    });
  }

  async softDelete(id: string, currentUserId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id, deletedAt: null },
      include: { shares: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const hasAccess = expense.shares.some(
      (s) => s.userId === currentUserId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this expense',
      );
    }

    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: currentUserId },
    });
  }

  async restore(id: string, currentUserId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const hasAccess = expense.shares.some(
      (s) => s.userId === currentUserId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this expense',
      );
    }

    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: null, deletedById: null },
      include: EXPENSE_INCLUDE,
    });
  }

  private validateShares(
    shares: Array<{ paidShare: number; owedShare: number }>,
    cost: number,
  ) {
    const totalPaid = shares.reduce((sum, s) => sum + s.paidShare, 0);
    const totalOwed = shares.reduce((sum, s) => sum + s.owedShare, 0);
    const epsilon = 0.02;

    if (Math.abs(totalPaid - cost) > epsilon) {
      throw new BadRequestException(
        `Total paid shares (${totalPaid.toFixed(2)}) must equal the cost (${cost.toFixed(2)})`,
      );
    }

    if (Math.abs(totalOwed - cost) > epsilon) {
      throw new BadRequestException(
        `Total owed shares (${totalOwed.toFixed(2)}) must equal the cost (${cost.toFixed(2)})`,
      );
    }
  }
}
