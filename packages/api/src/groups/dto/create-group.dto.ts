import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { GroupType } from '@prisma/client';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(GroupType)
  groupType?: GroupType;

  @IsOptional()
  @IsBoolean()
  simplifyByDefault?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];
}
