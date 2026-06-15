import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { NotificationsService } from "./notifications.service";
import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Query() query: ListNotificationsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.findAll(query, user.id);
  }
}
