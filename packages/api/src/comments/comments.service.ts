import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const COMMENT_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  picture: true,
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByExpense(expenseId: string, currentUserId: string) {
    await this.assertExpenseAccess(expenseId, currentUserId);

    return this.prisma.comment.findMany({
      where: { expenseId, deletedAt: null },
      include: { user: { select: COMMENT_USER_SELECT } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    expenseId: string,
    dto: CreateCommentDto,
    currentUserId: string,
  ) {
    await this.assertExpenseAccess(expenseId, currentUserId);

    return this.prisma.comment.create({
      data: {
        expenseId,
        userId: currentUserId,
        content: dto.content,
        commentType: 'USER',
      },
      include: { user: { select: COMMENT_USER_SELECT } },
    });
  }

  async remove(commentId: string, currentUserId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deletedAt: null },
      include: {
        expense: {
          select: { createdById: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.userId === currentUserId;
    const isExpenseCreator =
      comment.expense.createdById === currentUserId;

    if (!isAuthor && !isExpenseCreator) {
      throw new ForbiddenException(
        'You can only delete your own comments or comments on expenses you created',
      );
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  private async assertExpenseAccess(
    expenseId: string,
    userId: string,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId, deletedAt: null },
      include: { shares: { select: { userId: true } } },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const hasAccess = expense.shares.some((s) => s.userId === userId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this expense',
      );
    }
  }
}
