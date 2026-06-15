import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('expenses/:expenseId/comments')
  findAll(
    @Param('expenseId') expenseId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.findByExpense(expenseId, user.id);
  }

  @Post('expenses/:expenseId/comments')
  create(
    @Param('expenseId') expenseId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(expenseId, dto, user.id);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user.id);
  }
}
