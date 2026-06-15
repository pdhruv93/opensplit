import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.friendsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.friendsService.findById(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateFriendDto, @CurrentUser() user: User) {
    return this.friendsService.create(dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.friendsService.remove(id, user.id);
  }
}
