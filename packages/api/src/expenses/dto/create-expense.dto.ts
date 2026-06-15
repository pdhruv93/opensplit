import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RepeatInterval } from '@prisma/client';

export class ExpenseShareDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0)
  paidShare: number;

  @IsNumber()
  @Min(0)
  owedShare: number;
}

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  groupId?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsString()
  currencyCode: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(RepeatInterval)
  repeatInterval?: RepeatInterval;

  @IsOptional()
  @IsBoolean()
  payment?: boolean;

  @IsOptional()
  @IsBoolean()
  splitEqually?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseShareDto)
  shares?: ExpenseShareDto[];
}
